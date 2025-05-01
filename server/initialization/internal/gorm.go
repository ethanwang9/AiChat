package internal

import (
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
func gormInitRecords() {}
