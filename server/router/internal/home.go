package internal

import (
	"github.com/gin-gonic/gin"
	"server/controller"
)

func Home(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		r.GET("/base", controller.GetHomeBase)
	}
}
