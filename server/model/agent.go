package model

import (
	"go.uber.org/zap"
	"server/global"
)

type Agent struct {
	ID          int64 `gorm:"primaryKey;autoIncrement"`
	Name        string
	Description string
	Prompt      string
	Temperature float32
	Avatar      string
	Category    string
	Base
}

// AgentApp 实例化
var AgentApp = new(Agent)

// New 初始化
func (d *Agent) New(s Agent) *Agent {
	return &s
}

// Set 设置通道
func (d *Agent) Set() (err error) {
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体表#设置数据失败", zap.Error(err))
		return
	}
	return
}
