package initialization

import (
	"server/global"
	"server/initialization/internal"
	"server/service"
)

// AppInit 初始化
func AppInit() {
	// 初始化服务
	global.APP_LOG = service.Zap()
	global.APP_DB = service.Gorm()

	// 初始化数据库
	internal.GormInit()

	// 初始化系统目录
	internal.DirectoryInit()
}
