package router

import (
	"github.com/gin-gonic/gin"
	"server/global"
	"server/middleware"
	"server/router/internal"
)

// Init 初始化路由
func Init() *gin.Engine {
	// gin 模式
	switch global.SysMode {
	case "debug":
		gin.SetMode(gin.DebugMode)
	case "release":
		gin.SetMode(gin.ReleaseMode)
	default:
		gin.SetMode(gin.ReleaseMode)
	}

	// 路由
	router := gin.New()

	// 中间件
	router.Use(middleware.GinRecovery(true))
	router.Use(middleware.AuthVerify())
	router.Use(middleware.DefaultLogger())

	// 静态资源目录
	router.Static("/assets", global.AssetsPath)

	// 路由
	r := router.Group("/v1")
	{
		internal.Auth(r, "/auth")
		internal.Home(r, "/home")
		internal.Chat(r, "/chat")
		internal.Admin(r, "/admin")
	}

	return router
}
