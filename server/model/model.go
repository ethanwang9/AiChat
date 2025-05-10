package model

import (
	"encoding/json"
	"go.uber.org/zap"
	"server/global"
)

type Model struct {
	ID       int `gorm:"primaryKey;autoIncrement"`
	Cid      int
	Name     string
	Nickname string
	Category json.RawMessage `gorm:"type:json"`
	Status   string          `gorm:"default:'use'"`
	Base
}

// ModelApp 实例化
var ModelApp = new(Model)

// New 初始化
func (d *Model) New(s Model) *Model {
	return &s
}

// Get 获取模型
func (d *Model) Get() (data Model, err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#获取数据失败", zap.Error(err))
		return
	}
	return
}

// GetCidAndNickname 条件查询 cid、nickname
func (d *Model) GetCidAndNickname() (data Model, err error) {
	if err = global.APP_DB.Model(&d).Where("cid = ? and nickname = ?", d.Cid, d.Nickname).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#获取数据失败", zap.Error(err))
		return
	}
	return
}

// All 获取全部数据
func (d *Model) All() (data []Model, err error) {
	if err = global.APP_DB.Model(&d).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#获取全部数据失败", zap.Error(err))
		return
	}
	return
}
