package model

import (
	"server/global"
	"server/utils"
	"time"

	"go.uber.org/zap"
)

type HistoryPk struct {
	ID       string `gorm:"primaryKey" json:"id"`
	Uid      int64  `json:"uid"`
	Mid1     int    `json:"mid1"`
	Mid2     int    `json:"mid2"`
	Question string `json:"question"`
	Answer1  string `json:"answer1"`
	Answer2  string `json:"answer2"`
	Base
}

// HistoryPkApp 实例化
var HistoryPkApp = new(HistoryPk)

// New 初始化
func (d *HistoryPk) New(s HistoryPk) *HistoryPk {
	return &s
}

// Set 设置
func (d *HistoryPk) Set() (err error) {
	d.ID, _ = utils.ToolApp.UUID()
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史擂台表#设置数据失败", zap.Error(err))
		return
	}
	return
}

// GetLimits 获取分页数据 - admin
func (d *HistoryPk) GetLimits(limit int, offset int) (data []HistoryPk, err error) {
	if err = global.APP_DB.Model(&d).
		Unscoped().
		Limit(limit).
		Offset(offset).
		Order("created_at desc").
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史擂台表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Count 获取全部记录数量
func (d *HistoryPk) Count() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史擂台表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Delete 删除
func (d *HistoryPk) Delete() (err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Where("id = ?", d.ID).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史擂台表#删除数据失败", zap.Error(err))
		return
	}
	return
}

// CountToday 获取今日对话
func (d *HistoryPk) CountToday() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Where("created_at >= ?", time.Now().Format("2006-01-02")).Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史擂台表#获取今日对话数失败", zap.Error(err))
		return
	}
	return
}

// Range 获取时间范围内的数据
func (d *HistoryPk) Range(start string, end string) (data []HistoryRange, err error) {
	var results []HistoryRange
	startData, _ := time.Parse("2006-01-02", start)
	endData, _ := time.Parse("2006-01-02", end)

	if err := global.APP_DB.Model(&d).
		Select("DATE(created_at) as date, COUNT(*) as value").
		Where("created_at BETWEEN ? AND ?",
			startData.Format("2006-01-02")+" 00:00:00",
			endData.Format("2006-01-02")+" 23:59:59").
		Group("DATE(created_at)").
		Order("date").
		Scan(&results).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史擂台表#获取时间范围内的数据失败", zap.Error(err))
		return nil, err
	}

	return results, err
}
