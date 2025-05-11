package model

import (
	"go.uber.org/zap"
	"server/global"
)

type Model struct {
	ID       int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Cid      int    `json:"cid"`
	Name     string `json:"name"`
	Nickname string `json:"nickname"`
	Status   string `gorm:"default:'use'" json:"status"`
	Base
}

// ModelApp 实例化
var ModelApp = new(Model)

// New 初始化
func (d *Model) New(s Model) *Model {
	return &s
}

// Set 设置通道
func (d *Model) Set() (err error) {
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#设置数据失败", zap.Error(err))
		return
	}
	return
}

// Get 获取模型
func (d *Model) Get() (data Model, err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#获取数据失败", zap.Error(err))
		return
	}
	return
}

// GetCID 条件查询 cid
func (d *Model) GetCID() (data []Model, err error) {
	if err = global.APP_DB.Model(&d).Where("cid = ?", d.Cid).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#条件查询cid失败", zap.Error(err))
		return
	}
	return
}

// GetCidAndNickname 条件查询 cid、nickname
func (d *Model) GetCidAndNickname() (data Model, err error) {
	if err = global.APP_DB.Model(&d).Where("cid = ? and nickname = ?", d.Cid, d.Nickname).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#条件查询cid、nickname失败", zap.Error(err))
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

// GetLimit 获取分页数据
func (d *Model) GetLimit(limit int, offset int) (data []Model, err error) {
	if err = global.APP_DB.Model(&d).
		Limit(limit).
		Offset(offset).
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Count 获取记录数量
func (d *Model) Count() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#获取记录数量失败", zap.Error(err))
		return
	}
	return
}

// UpdateID 更新数据
func (d *Model) UpdateID() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Updates(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#更新数据失败", zap.Error(err))
		return
	}
	return
}

// Delete 删除通道
func (d *Model) Delete() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 模型表#删除数据失败", zap.Error(err))
		return
	}
	return
}
