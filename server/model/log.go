package model

import (
	"server/global"
	"server/utils"

	"go.uber.org/zap"
)

type Log struct {
	ID      string `gorm:"primaryKey" json:"id"`
	Operate string `json:"operate"`
	Uid     int64  `json:"uid"`
	Job     string `json:"job"`
	Content string `json:"content"`
	Base
}

// LogApp 实例化
var LogApp = new(Log)

// New 初始化
func (d *Log) New(s Log) *Log {
	return &s
}

// Set 设置
func (d *Log) Set() (err error) {
	d.ID, _ = utils.ToolApp.UUID()
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 日志表#创建数据失败", zap.Error(err))
		return
	}
	return
}

// GetLimit 获取分页数据
func (d *Log) GetLimit(limit int, offset int) (data []Log, err error) {
	if err = global.APP_DB.Model(&d).
		Limit(limit).
		Offset(offset).
		Order("created_at desc").
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 日志表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Count 获取记录数量
func (d *Log) Count() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 日志表#获取记录数量失败", zap.Error(err))
		return
	}
	return
}

// DeleteID 删除记录
func (d *Log) DeleteID() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 日志表#删除记录失败", zap.Error(err))
		return
	}
	return
}
