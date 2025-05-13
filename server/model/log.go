package model

import (
	"encoding/json"
	"server/global"
	"server/utils"
	"time"

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

// TodayTokenCount 获取今日Token数量
func (d *Log) TodayTokenCount() (count int64, err error) {
	var data []Log
	if err = global.APP_DB.Model(&d).
		Unscoped().
		Where("operate = ? and job = ? and created_at >= ?", "系统任务", "Token统计", time.Now().Format("2006-01-02")).
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 日志表#获取今日Token数量失败", zap.Error(err))
		return
	}
	type ct struct {
		PromptTokens        int64 `json:"prompt_tokens"`
		CompletionTokens    int64 `json:"completion_tokens"`
		TotalTokens         int64 `json:"total_tokens"`
		PromptTokensDetails struct {
			AudioTokens  int64 `json:"audio_tokens"`
			CachedTokens int64 `json:"cached_tokens"`
		} `json:"prompt_tokens_details"`
		CompletionTokensDetails interface{} `json:"completion_tokens_details"`
	}
	for _, v := range data {
		var ctData ct
		_ = json.Unmarshal([]byte(v.Content), &ctData)
		count += ctData.TotalTokens
	}
	return
}

// TokenCount 获取全部Token
func (d *Log) TokenCount() (count int64, err error) {
	var data []Log
	if err = global.APP_DB.Model(&d).
		Unscoped().
		Where("operate = ? and job = ?", "系统任务", "Token统计").
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 日志表#获取今日Token数量失败", zap.Error(err))
		return
	}
	type ct struct {
		PromptTokens        int64 `json:"prompt_tokens"`
		CompletionTokens    int64 `json:"completion_tokens"`
		TotalTokens         int64 `json:"total_tokens"`
		PromptTokensDetails struct {
			AudioTokens  int64 `json:"audio_tokens"`
			CachedTokens int64 `json:"cached_tokens"`
		} `json:"prompt_tokens_details"`
		CompletionTokensDetails interface{} `json:"completion_tokens_details"`
	}
	for _, v := range data {
		var ctData ct
		_ = json.Unmarshal([]byte(v.Content), &ctData)
		count += ctData.TotalTokens
	}
	return
}

// RangeLog 获取基于时间的日志记录
func (d *Log) RangeLog(start string, end string) (data []Log, err error) {
	startData, _ := time.Parse("2006-01-02", start)
	endData, _ := time.Parse("2006-01-02", end)

	if err = global.APP_DB.Model(&d).Unscoped().
		Where("created_at >= ? AND created_at <= ? AND operate = ? AND job = ?",
			startData.Format("2006-01-02"),
			endData.Format("2006-01-02"),
			"系统任务",
			"Token统计",
		).
		Order("created_at").
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 日志表#获取时间范围Token统计失败", zap.Error(err))
		return
	}
	return
}
