package model

import (
	"go.uber.org/zap"
	"server/global"
	"server/utils"
)

type HistoryPk struct {
	ID       string `gorm:"primaryKey"`
	Uid      int64
	Mid1     int
	Mid2     int
	Question string
	Answer1  string
	Answer2  string
	Base
}

// HistoryPkApp 实例化
var HistoryPkApp = new(HistoryPk)

// New 初始化
func (d *HistoryPk) New(s HistoryPk) *HistoryPk {
	return &s
}

// Set 设置
func (d *HistoryPk) Set() (err error) {
	d.ID, _ = utils.ToolApp.UUID()
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史擂台表#设置数据失败", zap.Error(err))
		return
	}
	return
}
