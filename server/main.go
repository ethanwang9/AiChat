package main

import (
	"fmt"
	"go.uber.org/zap"
	"server/global"
	"server/initialization"
	"server/router"
)

func main() {
	// 初始化
	initialization.AppInit()

	// 路由初始化
	r := router.Init()

	// 运行接口服务
	err := r.Run(fmt.Sprintf(":%d", global.SysPort))
	if err != nil {
		global.APP_LOG.Panic("接口服务启动失败", zap.Error(err))
	}
}
