package chat

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"server/api"
	"server/api/bigModel"
	"server/global"
	"server/model"
	"server/service"
	"server/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/sashabaranov/go-openai"
)

// GetChatChat 对话服务
func GetChatChat(ctx *gin.Context) {
	// 获取请求参数
	channel := ctx.PostForm("channel")
	modelName := ctx.PostForm("model")
	question := ctx.PostForm("question")
	gid := ctx.PostForm("gid")
	aid := ctx.PostForm("aid")

	if len(channel) == 0 || len(modelName) == 0 || len(question) == 0 || len(gid) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数无效",
		})
		return
	}

	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, _ := service.JwtToken.Decode(tokenString)
	state, _ := token.GetIssuer()

	// 获取缓存信息
	cacheInfo, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusinessToken,
			Message: "令牌无效，请重新登录",
		})
		return
	case err != nil:
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取缓存信息失败，" + err.Error(),
		})
		return
	}
	var result global.RedisAuthMessage
	_ = json.Unmarshal([]byte(cacheInfo), &result)

	// 获取模型配置信息
	channelNumber, _ := strconv.Atoi(channel)
	channelData, err := model.ChannelApp.New(model.Channel{ID: channelNumber}).Get()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取通道配置失败，请再次重试！",
		})
		return
	}
	modelData, err := model.ModelApp.New(model.Model{Cid: channelNumber, Nickname: modelName, Status: "use"}).GetCidAndNickname()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取模型配置失败，请再次重试！",
		})
		return
	}

	// 获取提示词和微调参数
	var temperature float32 = 1
	var prompt string = "你是一名由小橙子工作室提供技术服务的AI智能助手，你中文名叫【小恐龙】，英文名叫【DinoPals】。" +
		"如果用户询问日常生活内容，回答请活泼一些；如果用户询问专业知识，回答风格请专业一些；如果用户回答比较消极，请像温柔的小天使一样鼓励用户；如果用户回答引战，回答用户风格语气请模仿贴吧老哥一样毫不留情、一针见血、充满讽刺意味、充满灰色幽默！" +
		"现在你需要有一定的记忆能力，如果用户发送的问题具有一定关联度，你需要解决上下文回答用户的问题。"
	if len(aid) > 0 {
		aidN, _ := strconv.ParseInt(aid, 10, 64)
		info, err := model.AgentApp.New(model.Agent{ID: aidN}).GetID()
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorSQL,
				Message: "获取数据失败，请再次重试！",
			})
			return
		}
		prompt = info.Prompt
		temperature = info.Temperature
	}

	// 构建对话请求
	historyList := make([]openai.ChatCompletionMessage, 0)
	historyList = append(historyList, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleSystem,
		Content: prompt,
	})

	// 加载历史记录
	history, err := model.HistoryChatApp.New(model.HistoryChat{
		Uid:     result.UID,
		GroupID: gid,
	}).GetID()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取对话失败",
		})
		return
	}
	for _, v := range history {
		historyList = append(historyList, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleUser,
			Content: v.Question,
		})
		historyList = append(historyList, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleAssistant,
			Content: v.Answer,
		})
	}

	// 写入用户问题
	historyList = append(historyList, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: question,
	})

	// 发起请求
	stream, err := api.Application.OpenAI.New(bigModel.OpenAI{
		BaseUrl:   channelData.URL,
		ApiKey:    channelData.Key,
		ModelName: modelData.Name,
	}).ChatStream(historyList, temperature)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求数据失败, Error: " + err.Error(),
		})
		return
	}
	defer stream.Close()

	// 转发对话内容
	ctx.Writer.Header().Set("Content-Type", "text/event-stream")
	ctx.Writer.Header().Set("Cache-Control", "no-cache")
	ctx.Writer.Header().Set("Connection", "keep-alive")
	for {
		// 消息结束
		response, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			// 可以做一些其他的业务
			return
		}

		// 消息错误
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusiness,
				Message: "消息返回错误, Error: " + err.Error(),
			})
			return
		}

		// 写入Token消耗数据
		if response.Usage != nil {
			t, _ := json.Marshal(response.Usage)
			_ = model.LogApp.New(model.Log{
				Operate: "系统任务",
				Uid:     result.UID,
				Job:     "Token统计",
				Content: string(t),
			}).Set()
		}

		// 转发消息
		if len(response.Choices[0].Delta.ReasoningContent) > 0 {
			ctx.SSEvent("chat", gin.H{"think": response.Choices[0].Delta.ReasoningContent})
		} else if len(response.Choices[0].Delta.Content) > 0 {
			ctx.SSEvent("chat", gin.H{"content": response.Choices[0].Delta.Content})
		}
		ctx.Writer.Flush()
	}
}

// GetChatModel 获取对话模型列表
func GetChatModel(ctx *gin.Context) {
	// 获取数据库数据
	channels, err := model.ChannelApp.New(model.Channel{}).All()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取通道数据失败",
		})
		return
	}
	models, err := model.ModelApp.New(model.Model{}).All()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取模型数据失败",
		})
	}

	// 数据清洗
	type ModelList struct {
		Id            int             `json:"id"`
		ChannelName   string          `json:"channel_name"`
		ModelNickname string          `json:"model_nickname"`
		Category      json.RawMessage `json:"category"`
	}
	modelList := make([]ModelList, 0)
	for _, v := range channels {
		for _, v2 := range models {
			if v.ID == v2.Cid && v2.Status == "use" {
				modelList = append(modelList, ModelList{
					Id:            v.ID,
					ChannelName:   v.Name,
					ModelNickname: v2.Nickname,
				})
			}
		}
	}

	// 返回消息
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    modelList,
	})
}

// PostChatHistory 上报对话记录
func PostChatHistory(ctx *gin.Context) {
	// 获取参数
	groupId := ctx.PostForm("group_id")
	title := ctx.PostForm("title")
	question := ctx.PostForm("question")
	answer := ctx.PostForm("answer")

	if len(groupId) == 0 || len(title) == 0 || len(question) == 0 || len(answer) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数无效",
		})
		return
	}

	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, _ := service.JwtToken.Decode(tokenString)
	state, _ := token.GetIssuer()

	// 获取缓存信息
	cacheInfo, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusinessToken,
			Message: "令牌无效，请重新登录",
		})
		return
	case err != nil:
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取缓存信息失败，" + err.Error(),
		})
		return
	}
	var result global.RedisAuthMessage
	_ = json.Unmarshal([]byte(cacheInfo), &result)

	// 写入数据库
	u, _ := utils.ToolApp.UUID()
	err = model.HistoryChatApp.New(model.HistoryChat{
		ID:       u,
		Uid:      result.UID,
		GroupID:  groupId,
		Title:    title,
		Question: question,
		Answer:   answer,
	}).Set()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "保存对话记录失败",
		})
		return
	}

	// 返回消息
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// GetChatHistory 获取历史对话记录前35条
func GetChatHistory(ctx *gin.Context) {
	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, _ := service.JwtToken.Decode(tokenString)
	state, _ := token.GetIssuer()

	// 获取缓存信息
	cacheInfo, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusinessToken,
			Message: "令牌无效，请重新登录",
		})
		return
	case err != nil:
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取缓存信息失败，" + err.Error(),
		})
		return
	}
	var result global.RedisAuthMessage
	_ = json.Unmarshal([]byte(cacheInfo), &result)

	// 获取数据库前35条数据
	history35, err := model.HistoryChatApp.New(model.HistoryChat{
		Uid: result.UID,
	}).GetHistory35()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败",
		})
		return
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    history35,
	})
}

// GetChatHistoryByID 获取指定历史记录
func GetChatHistoryByID(ctx *gin.Context) {
	// 获取参数
	id := ctx.Param("id")

	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, _ := service.JwtToken.Decode(tokenString)
	state, _ := token.GetIssuer()

	// 获取缓存信息
	cacheInfo, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusinessToken,
			Message: "令牌无效，请重新登录",
		})
		return
	case err != nil:
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取缓存信息失败，" + err.Error(),
		})
		return
	}
	var result global.RedisAuthMessage
	_ = json.Unmarshal([]byte(cacheInfo), &result)

	// 获取指定记录
	data, err := model.HistoryChatApp.New(model.HistoryChat{GroupID: id, Uid: result.UID}).GetID()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据库数据失败",
		})
		return
	}

	// 清洗后
	type historyMsg struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	msg := make([]historyMsg, 0)
	for _, v := range data {
		msg = append(msg, historyMsg{
			Role:    openai.ChatMessageRoleUser,
			Content: v.Question,
		})
		msg = append(msg, historyMsg{
			Role:    openai.ChatMessageRoleAssistant,
			Content: v.Answer,
		})
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    msg,
	})
}
