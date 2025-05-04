package internal

import (
	"github.com/gin-gonic/gin"
	"server/controller"
)

func Auth(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		// 获取登录信息
		r.GET("/login", controller.GetAuthLogin)
		// 回调函数
		r.GET("/back/:state", controller.GetAuthBack)
		// 校验是否登录
		r.GET("/check", controller.GetAuthCheck)
	}
}
