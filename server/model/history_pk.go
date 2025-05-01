package model

import "gorm.io/gorm"

type HistoryPk struct {
	ID        string `gorm:"primaryKey;size:32"`
	Uid       int64
	Mid1      int
	Mid2      int
	Question  string `gorm:"size:200"`
	Answer    string `gorm:"size:1000"`
	Answer2   string `gorm:"size:1000"`
	CreatedAt gorm.DeletedAt
	UpdatedAt gorm.DeletedAt
	DeletedAt gorm.DeletedAt
}
