package service

import (
	"fmt"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	"log"
	"os"
	"server/global"
	"time"
)

func Gorm() *gorm.DB {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%v)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		global.DBUser, global.DBPassword, global.DBHost, global.DBPort, global.DBName)

	// Gorm 配置
	config := gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			// 表前缀
			TablePrefix: global.DBPrefix,
			// 禁用表复数
			SingularTable: true,
		},
		Logger: logger.New(log.New(os.Stdout, "\r\n", log.LstdFlags), logger.Config{
			SlowThreshold: 200 * time.Millisecond,
			LogLevel:      logger.Warn,
			Colorful:      true,
		}),
		DisableForeignKeyConstraintWhenMigrating: true,
	}

	// 打开数据库
	db, err := gorm.Open(mysql.Open(dsn), &config)
	if err != nil {
		global.APP_LOG.Panic("[初始化] 数据库初始化失败", zap.Error(err))
	}

	// 设置连接池
	sqlDB, err := db.DB()
	if err != nil {
		global.APP_LOG.Panic("[初始化] 数据库连接池初始化失败", zap.Error(err))
		return nil
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db
}
