package model

import (
	"server/global"
	"server/utils"
	"time"

	"go.uber.org/zap"
)

type HistoryAgent struct {
	ID       string `gorm:"primaryKey" json:"id"`
	Uid      int64  `json:"uid"`
	Aid      int    `json:"aid"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Base
}

// HistoryAgentApp 实例化
var HistoryAgentApp = new(HistoryAgent)

// New 初始化
func (d *HistoryAgent) New(s HistoryAgent) *HistoryAgent {
	return &s
}

// Set 设置
func (d *HistoryAgent) Set() (err error) {
	d.ID, _ = utils.ToolApp.UUID()
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体历史记录表#设置数据失败", zap.Error(err))
		return
	}
	return
}

// GetLimits 获取分页数据 - admin
func (d *HistoryAgent) GetLimits(limit int, offset int) (data []HistoryAgent, err error) {
	if err = global.APP_DB.Model(&d).
		Unscoped().
		Limit(limit).
		Offset(offset).
		Order("created_at desc").
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体历史记录表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Count 获取全部记录数量
func (d *HistoryAgent) Count() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体历史记录表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// Delete 删除
func (d *HistoryAgent) Delete() (err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Where("id = ?", d.ID).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体历史记录表#删除数据失败", zap.Error(err))
		return
	}
	return
}

// CountToday 获取今日对话数
func (d *HistoryAgent) CountToday() (count int64, err error) {
	if err = global.APP_DB.Model(&d).Unscoped().Where("created_at >= ?", time.Now().Format("2006-01-02")).Count(&count).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体历史记录表#获取今日对话数失败", zap.Error(err))
		return
	}
	return
}

// Range 获取时间范围内的数据
func (d *HistoryAgent) Range(start string, end string) (data []HistoryRange, err error) {
	var results []HistoryRange
	startData, _ := time.Parse("2006-01-02", start)
	endData, _ := time.Parse("2006-01-02", end)

	if err := global.APP_DB.Model(&d).
		Select("DATE(created_at) as date, COUNT(*) as value").
		Where("created_at BETWEEN ? AND ?",
			startData.Format("2006-01-02")+" 00:00:00",
			endData.Format("2006-04-02")+" 23:59:59").
		Group("DATE(created_at)").
		Order("date").
		Scan(&results).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 智能体历史记录表#获取时间范围内的数据失败", zap.Error(err))
		return nil, err
	}

	return results, err
}
