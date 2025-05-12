package model

import (
	"go.uber.org/zap"
	"server/global"
)

type User struct {
	Uid    int64 `gorm:"primaryKey;autoIncrement"`
	Name   string
	Mail   string `gorm:"unique"`
	Phone  string `gorm:"unique"`
	Avatar string
	Status string `gorm:"default:'use'"`
	Role   string `gorm:"default:'user'"`
	Base
}

// UserApp 实例化
var UserApp = new(User)

// New 初始化
func (d *User) New(s User) *User {
	return &s
}

// Get 获取数据
func (d *User) Get() (data User, err error) {
	if err = global.APP_DB.Model(&d).Where("uid = ?", d.Uid).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户表#获取数据失败", zap.Error(err))
		return
	}
	return
}

// Set 设置数据
func (d *User) Set() (u *User, err error) {
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户表#设置数据失败", zap.Error(err))
		return nil, err
	}
	return d, nil
}

// Count 数量
func (d *User) Count() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户表#获取用户数量失败", zap.Error(err))
		return
	}
	return
}

// Update 更新数据
func (d *User) Update() (err error) {
	if err = global.APP_DB.Model(&d).Where("uid = ?", d.Uid).Updates(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户表#更新数据失败", zap.Error(err))
		return
	}
	return
}

// Delete 删除账号
func (d *User) Delete() (err error) {
	if err = global.APP_DB.Model(&d).Where("uid = ?", d.Uid).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户表#删除数据失败", zap.Error(err))
		return
	}
	return
}
