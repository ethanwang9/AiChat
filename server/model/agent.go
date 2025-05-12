package model

import (
	"go.uber.org/zap"
	"server/global"
)

type Agent struct {
	ID          int64   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Prompt      string  `json:"prompt"`
	Temperature float32 `json:"temperature"`
	Avatar      string  `json:"avatar"`
	Category    string  `json:"category"`
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

// GetLimit 获取分页数据
func (d *Agent) GetLimit(limit int, offset int) (data []Agent, err error) {
	if err = global.APP_DB.Model(&d).Limit(limit).Offset(offset).Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Count 获取总数
func (d *Agent) Count() (total int64, err error) {
	if err = global.APP_DB.Model(&d).Count(&total).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体表#获取总数失败", zap.Error(err))
		return
	}
	return
}

// Delete 删除数据
func (d *Agent) Delete() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体表#删除数据失败", zap.Error(err))
		return
	}
	return
}

// Update 更新数据
func (d *Agent) Update() (err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).Updates(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体表#更新数据失败", zap.Error(err))
		return
	}
	return
}

// GetCategory 获取分类
func (d *Agent) GetCategory() (data []Agent, err error) {
	if err = global.APP_DB.Model(&d).Distinct("category").Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体表#获取分类失败", zap.Error(err))
		return
	}
	return
}

// GetList 获取列表
func (d *Agent) GetList(category string) (data []Agent, err error) {
	if d.Category == "全部" {
		if err = global.APP_DB.Model(&d).Find(&data).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 智能体表#获取列表失败", zap.Error(err))
			return
		}
	} else {
		if err = global.APP_DB.Model(&d).Where("category = ?", category).Find(&data).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 智能体表#获取列表失败", zap.Error(err))
			return
		}
	}
	return
}

// GetID 获取指定数据
func (d *Agent) GetID() (data Agent, err error) {
	if err = global.APP_DB.Model(&d).Where("id = ?", d.ID).First(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体表#获取指定数据失败", zap.Error(err))
		return
	}
	return
}
