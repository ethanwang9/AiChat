package chat

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/sashabaranov/go-openai"
	"io"
	"net/http"
	"server/api"
	"server/api/bigModel"
	"server/global"
	"server/model"
	"server/service"
	"strconv"
)

// GetChatChat 对话服务
func GetChatChat(ctx *gin.Context) {
	// 获取请求参数
	channel := ctx.PostForm("channel")
	modelName := ctx.PostForm("model")
	chatHistory := ctx.PostForm("history")

	if len(channel) == 0 || len(modelName) == 0 || len(chatHistory) == 0 {
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

	// 构建对话请求
	var history []global.ChatHistory
	err = json.Unmarshal([]byte(chatHistory), &history)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSys,
			Message: "解析历史对话记录失败，请再次重试！",
		})
	}
	historyList := make([]openai.ChatCompletionMessage, 0)
	historyList = append(historyList, openai.ChatCompletionMessage{
		Role: openai.ChatMessageRoleSystem,
		Content: "你是一名由小橙子工作室提供技术服务的AI智能助手，你中文名叫【小恐龙】，英文名叫【DinoPals】。" +
			"现在你需要帮助用户解答疑惑，当用户的问题涉嫌违规时你只需要告诉用户【违规内容，暂不提供服务！】，并告诉用户哪里违规了。" +
			"如果用户询问日常生活内容，回答请活泼一些；如果用户询问专业知识，回答风格请专业一些；如果用户回答比较消极，请像温柔的小天使一样鼓励用户；如果用户回答引战，回答用户风格语气请模仿贴吧老哥一样毫不留情、一针见血、充满讽刺意味、充满灰色幽默！" +
			"下面是一些格式规范：图标类使用Mermaid库语法。",
	})
	for _, v := range history {
		var role string
		switch v.Role {
		case openai.ChatMessageRoleSystem:
			role = openai.ChatMessageRoleSystem
		case openai.ChatMessageRoleUser:
			role = openai.ChatMessageRoleUser
		case openai.ChatMessageRoleAssistant:
			role = openai.ChatMessageRoleAssistant
		}
		historyList = append(historyList, openai.ChatCompletionMessage{
			Role:    role,
			Content: v.Content,
		})
	}
	stream, err := api.Application.OpenAI.New(bigModel.OpenAI{
		BaseUrl:   channelData.URL,
		ApiKey:    channelData.Key,
		ModelName: modelData.Name,
	}).ChatStream(historyList, 1)
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
			// TODO 对话记录写入数据库
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

		// TODO 写入Token消耗数据
		if response.Usage != nil {
			fmt.Println(response.Usage)
		}

		// 转发消息
		if len(response.Choices[0].Delta.ReasoningContent) > 0 {
			ctx.SSEvent("chat", gin.H{"reasoning": response.Choices[0].Delta.ReasoningContent})
		} else if len(response.Choices[0].Delta.Content) > 0 {
			ctx.SSEvent("chat", gin.H{"content": response.Choices[0].Delta.Content})
		}
		ctx.Writer.Flush()
	}
}
