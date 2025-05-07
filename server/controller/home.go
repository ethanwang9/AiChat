package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"server/global"
	"server/model"
)

func GetHomeBase(ctx *gin.Context) {
	// 获取数据库网站信息
	info, err := model.SystemApp.New(model.System{}).Get()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取网站信息失败，请再次重试！",
			Data:    nil,
		})
		return
	}

	// 返回数据信息
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"gov":  info.Gov,
			"icp":  info.Icp,
			"name": info.Name,
		},
	})
}
