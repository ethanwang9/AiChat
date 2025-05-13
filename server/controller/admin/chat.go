package admin

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"net/http"
	"net/url"
	"server/global"
	"server/model"
	"server/service"
	"strconv"
)

// GetAdminChatHistory 获取对话历史记录
func GetAdminChatHistory(ctx *gin.Context) {
	// 获取参数
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	if len(limit) == 0 || len(offset) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
			Data:    nil,
		})
		return
	}

	// 获取数据
	limitN, _ := strconv.Atoi(limit)
	offsetN, _ := strconv.Atoi(offset)
	limits, err := model.HistoryChatApp.New(model.HistoryChat{}).GetLimits(limitN, (offsetN-1)*limitN)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，请再次重试！",
		})
		return
	}

	// 获取数量
	count, err := model.HistoryChatApp.New(model.HistoryChat{}).Count()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，请再次重试！",
		})
		return
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"history": limits,
			"total":   count,
		},
	})
}

// GetAdminChatAgent 获取智能体聊天记录
func GetAdminChatAgent(ctx *gin.Context) {
	// 获取参数
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	if len(limit) == 0 || len(offset) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
			Data:    nil,
		})
		return
	}

	// 获取数据
	limitN, _ := strconv.Atoi(limit)
	offsetN, _ := strconv.Atoi(offset)
	limits, err := model.HistoryAgentApp.New(model.HistoryAgent{}).GetLimits(limitN, (offsetN-1)*limitN)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，请再次重试！",
		})
		return
	}

	// 获取数量
	count, err := model.HistoryAgentApp.New(model.HistoryAgent{}).Count()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，请再次重试！",
		})
		return
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"agent": limits,
			"total": count,
		},
	})
}

// GetAdminChatPk 获取擂台记录
func GetAdminChatPk(ctx *gin.Context) {
	// 获取参数
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	if len(limit) == 0 || len(offset) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
			Data:    nil,
		})
		return
	}

	// 获取数据
	limitN, _ := strconv.Atoi(limit)
	offsetN, _ := strconv.Atoi(offset)
	limits, err := model.HistoryPkApp.New(model.HistoryPk{}).GetLimits(limitN, (offsetN-1)*limitN)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，请再次重试！",
		})
		return
	}

	// 获取数量
	count, err := model.HistoryPkApp.New(model.HistoryPk{}).Count()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，请再次重试！",
		})
		return
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"pk":    limits,
			"total": count,
		},
	})

}

// DeleteAdminChatHistory 删除对话历史记录
func DeleteAdminChatHistory(ctx *gin.Context) {
	// 获取参数
	body, _ := ctx.GetRawData()
	params, _ := url.ParseQuery(string(body))
	id := params.Get("id")

	if len(id) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数错误",
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
	err = model.HistoryChatApp.New(model.HistoryChat{ID: id}).Delete()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "删除数据失败",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "删除历史对话记录",
		Content: fmt.Sprintf("管理员删除了%s的对话记录", id),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// DeleteAdminChatAgent 删除智能体历史记录
func DeleteAdminChatAgent(ctx *gin.Context) {
	// 获取参数
	body, _ := ctx.GetRawData()
	params, _ := url.ParseQuery(string(body))
	id := params.Get("id")

	if len(id) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数错误",
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
	err = model.HistoryAgentApp.New(model.HistoryAgent{ID: id}).Delete()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "删除数据失败",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "删除智能体对话记录",
		Content: fmt.Sprintf("管理员删除了%s的对话记录", id),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// DeleteAdminChatPk 删除擂台历史记录
func DeleteAdminChatPk(ctx *gin.Context) {
	// 获取参数
	body, _ := ctx.GetRawData()
	params, _ := url.ParseQuery(string(body))
	id := params.Get("id")

	if len(id) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数错误",
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
	err = model.HistoryPkApp.New(model.HistoryPk{ID: id}).Delete()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "删除数据失败",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "删除擂台对话记录",
		Content: fmt.Sprintf("管理员删除了%s的对话记录", id),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}
