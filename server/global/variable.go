package global

import (
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	// APP_LOG 日志
	APP_LOG *zap.Logger
	// APP_DB 数据库
	APP_DB *gorm.DB
	// APP_REDIS 缓存数据库
	APP_REDIS *redis.Client
)
