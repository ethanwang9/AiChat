package chat

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"server/global"
	"server/model"
	"server/service"
	"strconv"

	"github.com/redis/go-redis/v9"

	"github.com/gin-gonic/gin"
)

// GetChatAgentCategory 获取智能体分类
func GetChatAgentCategory(ctx *gin.Context) {
	// 获取数据
	category, err := model.AgentApp.New(model.Agent{}).GetCategory()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
	}

	// 处理数据
	data := make([]string, 0)
	for _, v := range category {
		data = append(data, v.Category)
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    data,
	})
}

// GetChatAgentList 获取智能体列表
func GetChatAgentList(ctx *gin.Context) {
	// 获取参数
	category := ctx.Query("category")

	if len(category) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取数据
	agent, err := model.AgentApp.New(model.Agent{Category: category}).GetList(category)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
	}

	// 处理数据
	for i, v := range agent {
		agent[i].Avatar = global.SysDomain + v.Avatar
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    agent,
	})
}

// GetChatAgentID 获取指定智能体信息
func GetChatAgentID(ctx *gin.Context) {
	// 获取参数
	id := ctx.Param("id")
	if len(id) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取数据
	idN, _ := strconv.ParseInt(id, 10, 64)
	agent, err := model.AgentApp.New(model.Agent{ID: idN}).GetID()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
	}

	// 处理数据
	agent.Avatar = global.SysDomain + agent.Avatar

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    agent,
	})
}

// PostChatAgent 上报智能体对话记录
func PostChatAgent(ctx *gin.Context) {
	// 获取参数
	aid := ctx.PostForm("aid")
	question := ctx.PostForm("question")
	answer := ctx.PostForm("answer")

	if len(aid) == 0 || len(question) == 0 || len(answer) == 0 {
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
	aidN, _ := strconv.Atoi(aid)
	err = model.HistoryAgentApp.New(model.HistoryAgent{
		Uid:      result.UID,
		Aid:      aidN,
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
