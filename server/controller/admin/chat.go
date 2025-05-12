package admin

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"server/global"
	"server/model"
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
