package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"server/global"
)

func GetHomeBase(ctx *gin.Context) {
	// 返回数据信息
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    nil,
	})
}
