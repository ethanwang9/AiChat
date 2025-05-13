package model

import (
	"server/global"

	"go.uber.org/zap"
)

type User struct {
	Uid    int64  `gorm:"primaryKey;autoIncrement" json:"uid"`
	Name   string `json:"name"`
	Mail   string `json:"mail"`
	Phone  string `json:"phone"`
	Avatar string `json:"avatar"`
	Status string `gorm:"default:'use'" json:"status"`
	Role   string `gorm:"default:'user'" json:"role"`
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

// CountAll 获取所有用户数量
func (d *User) CountAll() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户表#获取所有用户数量失败", zap.Error(err))
		return
	}
	return
}
// Update 更新数据
func (d *User) Update() (err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Where("uid = ?", d.Uid).Updates(&d).Update("deleted_at", nil).Error; err != nil {
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

// ForceDelete 强制删除
func (d *User) ForceDelete() (err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Where("uid = ?", d.Uid).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 用户表#删除数据失败", zap.Error(err))
		return
	}
	return
}

// GetLimitAndSearch 获取查询分页数据
func (d *User) GetLimitAndSearch(limit int, offset int) (data []User, err error) {
	if d.Uid > 0 && len(d.Name) == 0 {
		// 如果uid有值，但是name没有值
		if err = global.APP_DB.Model(&d).Unscoped().
			Where("uid = ?", d.Uid).
			Order("created_at DESC").
			Limit(limit).
			Offset(offset).
			Find(&data).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	} else if d.Uid == 0 && len(d.Name) > 0 {
		// 如果uid无值，但是name有值
		if err = global.APP_DB.Model(&d).Unscoped().
			Where("name LIKE ?", "%"+d.Name+"%").
			Order("created_at DESC").
			Limit(limit).
			Offset(offset).
			Find(&data).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	} else if d.Uid == 0 && len(d.Name) == 0 {
		// 如果uid无值，name也无值
		if err = global.APP_DB.Model(&d).Unscoped().
			Order("created_at DESC").
			Limit(limit).
			Offset(offset).
			Find(&data).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	} else if d.Uid > 0 && len(d.Name) > 0 {
		// 如果uid有值，name也有值
		if err = global.APP_DB.Model(&d).Unscoped().
			Where("uid = ?", d.Uid).
			Where("name LIKE ?", "%"+d.Name+"%").
			Order("created_at DESC").
			Limit(limit).
			Offset(offset).
			Find(&data).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	}
	return
}

// GetLimitAndSearchTotal 获取查询分页数据总数
func (d *User) GetLimitAndSearchTotal() (count int64, err error) {
	if d.Uid > 0 && len(d.Name) == 0 {
		// 如果uid有值，但是name没有值
		if err = global.APP_DB.Model(&d).Unscoped().
			Where("uid = ?", d.Uid).
			Order("created_at DESC").
			Count(&count).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	} else if d.Uid == 0 && len(d.Name) > 0 {
		// 如果uid无值，但是name有值
		if err = global.APP_DB.Model(&d).Unscoped().
			Where("name LIKE ?", "%"+d.Name+"%").
			Order("created_at DESC").
			Count(&count).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	} else if d.Uid == 0 && len(d.Name) == 0 {
		// 如果uid无值，name也无值
		if err = global.APP_DB.Model(&d).Unscoped().
			Order("created_at DESC").
			Count(&count).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	} else if d.Uid > 0 && len(d.Name) > 0 {
		// 如果uid有值，name也有值
		if err = global.APP_DB.Model(&d).
			Where("uid = ?", d.Uid).Unscoped().
			Where("name LIKE ?", "%"+d.Name+"%").
			Order("created_at DESC").
			Count(&count).Error; err != nil {
			global.APP_LOG.Warn("[数据库] 用户表#获取查询分页数据失败", zap.Error(err))
			return
		}
	}
	return
}
