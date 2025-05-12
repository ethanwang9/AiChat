package model

import (
	"server/global"
	"server/utils"

	"go.uber.org/zap"
)

type HistoryAgent struct {
	ID       string `gorm:"primaryKey"`
	Uid      int64
	Aid      int
	Question string
	Answer   string
	Base
}

// HistoryAgentApp 实例化
var HistoryAgentApp = new(HistoryAgent)

// New 初始化
func (d *HistoryAgent) New(s HistoryAgent) *HistoryAgent {
	return &s
}

// Set 设置
func (d *HistoryAgent) Set() (err error) {
	d.ID, _ = utils.ToolApp.UUID()
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体历史记录表#设置数据失败", zap.Error(err))
		return
	}
	return
}
