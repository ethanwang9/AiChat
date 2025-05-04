package service

import (
	"context"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"server/global"
)

func Redis() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     global.RDBAddress,
		Password: global.RDBPassword,
		DB:       global.RDBDB,
	})
	_, err := client.Ping(context.Background()).Result()
	if err != nil {
		global.APP_LOG.Panic("redis初始化失败", zap.Error(err))
	}

	return client
}
