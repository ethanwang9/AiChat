package model

import (
	"server/global"

	"go.uber.org/zap"
)

type HistoryChat struct {
	ID       string `gorm:"primaryKey" json:"id"`
	Uid      int64  `json:"uid"`
	GroupID  string `gorm:"column:group_id" json:"group_id"`
	Title    string `json:"title"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Base
}

// HistoryChatApp 实例化
var HistoryChatApp = new(HistoryChat)

// New 初始化
func (d *HistoryChat) New(s HistoryChat) *HistoryChat {
	return &s
}

// Set 写入对话历史记录
func (d *HistoryChat) Set() (err error) {
	if err = global.APP_DB.Model(&d).Create(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史记录对话表#设置数据失败", zap.Error(err))
		return
	}
	return
}

// GetHistory35 获取历史记录前35条记录
func (d *HistoryChat) GetHistory35() (data []HistoryChat, err error) {
	subQuery := global.APP_DB.Model(&HistoryChat{}).
		Select("group_id, MAX(created_at) as max_time").
		Where("uid = ?", d.Uid).
		Group("group_id")

	if err = global.APP_DB.Model(&HistoryChat{}).
		Joins("JOIN (?) t2 ON ai_history_chat.group_id = t2.group_id AND ai_history_chat.created_at = t2.max_time", subQuery).
		Where("uid = ?", d.Uid).
		Order("created_at DESC").
		Limit(35).
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史记录对话表#获取数据失败", zap.Error(err))
		return
	}
	return
}

// GetID 获取指定ID
func (d *HistoryChat) GetID() (data []HistoryChat, err error) {
	if err = global.APP_DB.Model(&d).Where("group_id = ? and uid = ?", d.GroupID, d.Uid).Order("created_at asc").Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史记录对话表#获取获取指定ID失败", zap.Error(err))
		return
	}
	return
}

// GetLimit 获取分页
func (d *HistoryChat) GetLimit(limit int, offset int) (data []HistoryChat, err error) {
	subQuery := global.APP_DB.Model(&HistoryChat{}).
		Select("group_id, MAX(created_at) as max_time").
		Where("uid = ?", d.Uid).
		Group("group_id")

	if err = global.APP_DB.Model(&HistoryChat{}).
		Joins("JOIN (?) t2 ON ai_history_chat.group_id = t2.group_id AND ai_history_chat.created_at = t2.max_time", subQuery).
		Where("uid = ?", d.Uid).
		Order("created_at DESC").
		Limit(limit).
		Offset((offset - 1) * limit).
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史记录对话表#获取分页数据失败", zap.Error(err))
		return
	}
	return
}

// GetLimitTotal 获取分页总数
func (d *HistoryChat) GetLimitTotal() (data []HistoryChat, err error) {
	subQuery := global.APP_DB.Model(&HistoryChat{}).
		Select("group_id, MAX(created_at) as max_time").
		Where("uid = ?", d.Uid).
		Group("group_id")

	if err = global.APP_DB.Model(&HistoryChat{}).
		Joins("JOIN (?) t2 ON ai_history_chat.group_id = t2.group_id AND ai_history_chat.created_at = t2.max_time", subQuery).
		Where("uid = ?", d.Uid).
		Order("created_at DESC").
		Find(&data).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史记录对话表#获取分页总数失败", zap.Error(err))
		return
	}
	return
}

// DeleteAll 删除全部记录
func (d *HistoryChat) DeleteAll() (err error) {
	if err = global.APP_DB.Model(&d).Where("uid = ?", d.Uid).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史记录对话表#删除全部记录失败", zap.Error(err))
		return
	}
	return
}

// DeleteID 删除指定用户对话记录
func (d *HistoryChat) DeleteID() (err error) {
	if err = global.APP_DB.Model(&d).Where("uid = ? AND group_id = ?", d.Uid, d.GroupID).Delete(&d).Error; err != nil {
		global.APP_LOG.Warn("[数据库] 历史记录对话表#删除指定用户对话记录失败", zap.Error(err))
		return
	}
	return
}
