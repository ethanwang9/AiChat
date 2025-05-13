package model

import (
	"time"

	"gorm.io/gorm"
)

type Base struct {
	// 创建时间
	CreatedAt time.Time `json:"created_at,omitempty"`
	// 更新时间
	UpdatedAt time.Time `json:"updated_at,omitempty"`
	// 删除时间
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type HistoryRange struct {
	Date  string `json:"date"`
	Value int64  `json:"value"`
}
