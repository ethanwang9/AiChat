package model

import (
	"go.uber.org/zap"
	"server/global"
)

type Channel struct {
	ID    int `gorm:"primaryKey;autoIncrement"`
	Name  string
	URL   string
	Key   string
	Money float64 `gorm:"type:decimal(10,2)"`
	Base
}

// ChannelApp 实例化
var ChannelApp = new(Channel)

// New 初始化
func (d *Channel) New(s Channel) *Channel {
	return &s
}

// Get 获取通道
func (d *Channel) Get() (data Channel, err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型通道表#获取数据失败", zap.Error(err))
		return
	}
	return
}

// All 获取全部通道
func (d *Channel) All() (data []Channel, err error) {
	if err = global.APP_DB.Model(&d).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型通道表#获取全部数据失败", zap.Error(err))
		return
	}
	return
}
