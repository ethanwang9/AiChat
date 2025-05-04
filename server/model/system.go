package model

import (
	"go.uber.org/zap"
	"server/global"
)

type System struct {
	ID         int `gorm:"primaryKey;"`
	Logo       string
	Name       string
	Icp        string
	Gov        string
	LoginAppid string `gorm:"column:login_appid"`
	LoginKey   string `gorm:"column:login_key"`
	Base
}

// SystemApp 实例化
var SystemApp = new(System)

// New 初始化
func (d *System) New(s System) *System {
	return &s
}

// Get 获取数据
func (d *System) Get() (data System, err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", 1).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 系统表#获取数据", zap.Error(err))
		return
	}
	return
}

// Set 设置数据
func (d *System) Set() (err error) {
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 系统表#设置数据失败", zap.Error(err))
		return
	}
	return
}

// Update 更新数据
func (d *System) Update() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", 1).Updates(d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 系统表#更新内容失败", zap.Error(err))
		return
	}
	return
}
