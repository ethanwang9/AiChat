package internal

import (
	"github.com/gin-gonic/gin"
	"server/controller/admin"
)

func Admin(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		r.GET("/userinfo", admin.GetAdminUserinfo)
		r.GET("/manager/system", admin.GetAdminManagerSystem)
	}
}
