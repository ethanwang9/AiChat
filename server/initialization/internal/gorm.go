package internal

import (
	"go.uber.org/zap"
	"server/global"
	"server/model"
)

// GormInit 数据库初始化
func GormInit() {
	// 初始化数据库
	// 1. 初始化表
	gormInitTable()
	// 2. 写入临时记录
	gormInitRecords()

	global.APP_LOG.Info("[初始化] 数据库已完成自检.")
}

// 初始化表
func gormInitTable() {
	_ = global.APP_DB.AutoMigrate(
		&model.AccountBind{},
		&model.Agent{},
		&model.Channel{},
		&model.HistoryAgent{},
		&model.HistoryChat{},
		&model.HistoryPk{},
		&model.Log{},
		&model.Model{},
		&model.System{},
		&model.User{},
	)
}

// 初始化记录
func gormInitRecords() {
	// system是否有记录id=1，如果没有自动创建
	systemRecord, _ := model.SystemApp.New(model.System{}).Get()
	if len(systemRecord.Name) == 0 {
		if err := model.SystemApp.New(model.System{ID: 1, Name: "DinoPals"}).Set(); err != nil {
			global.APP_LOG.Warn("[初始化] 初始化数据库表System失败", zap.Error(err))
		}
	}
}
