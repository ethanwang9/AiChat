package model

type Agent struct {
	ID          int64  `gorm:"primaryKey;autoIncrement"`
	Name        string `gorm:"size:20"`
	Description string `gorm:"size:20"`
	Prompt      string `gorm:"size:500"`
	Temperature float32
	Avatar      string `gorm:"size:200"`
	Category    string `gorm:"size:20"`
	Base
}
