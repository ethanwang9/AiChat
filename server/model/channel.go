package model

import (
	"go.uber.org/zap"
	"server/global"
)

type Channel struct {
	ID    int     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name  string  `json:"name"`
	URL   string  `json:"url"`
	Key   string  `json:"key"`
	Money float64 `gorm:"type:decimal(10,2)" json:"money"`
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

// Set 设置通道
func (d *Channel) Set() (err error) {
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型通道表#设置数据失败", zap.Error(err))
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

// GetLimit 获取分页数据
func (d *Channel) GetLimit(limit int, offset int) (data []Channel, err error) {
	if err = global.APP_DB.Model(&d).
		Limit(limit).
		Offset(offset).
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型通道表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Count 获取记录数量
func (d *Channel) Count() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型通道表#获取记录数量失败", zap.Error(err))
		return
	}
	return
}

// UpdateID 更新数据
func (d *Channel) UpdateID() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Updates(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型通道表#更新数据失败", zap.Error(err))
		return
	}
	return
}

// Delete 删除通道
func (d *Channel) Delete() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型通道表#删除数据失败", zap.Error(err))
		return
	}
	return
}
