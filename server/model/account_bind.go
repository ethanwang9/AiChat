package model

import (
	"go.uber.org/zap"
	"server/global"
)

type AccountBind struct {
	ID     int64  `gorm:"primaryKey;autoIncrement"`
	Uid    int64  `gorm:"unique"`
	Wechat string `gorm:"unique"`
	Base
}

// AccountBindApp 实例化
var AccountBindApp = new(AccountBind)

// New 初始化
func (d *AccountBind) New(s AccountBind) *AccountBind {
	return &s
}

// GetWechat 获取绑定openid
func (d *AccountBind) GetWechat() (data AccountBind, err error) {
	if err = global.APP_DB.Model(&d).Where("wechat = ?", d.Wechat).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户绑定表#获取绑定openid数据", zap.Error(err))
		return
	}
	return
}

// Set 设置数据
func (d *AccountBind) Set() (err error) {
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户绑定表#设置数据失败", zap.Error(err))
		return
	}
	return
}
