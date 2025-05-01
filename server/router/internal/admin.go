package internal

import (
	"github.com/gin-gonic/gin"
)

func Admin(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		r.GET("/base")
	}
}
