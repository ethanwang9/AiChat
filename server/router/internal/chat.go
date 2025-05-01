package internal

import (
	"github.com/gin-gonic/gin"
)

func Chat(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		r.GET("/base")
	}
}
