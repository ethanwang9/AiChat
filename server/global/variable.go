package global

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	// APP_LOG 日志
	APP_LOG *zap.Logger
	// APP_DB 数据库
	APP_DB *gorm.DB
)
