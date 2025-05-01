package model

type Log struct {
	ID      string `gorm:"primaryKey;size:30"`
	Operate string `gorm:"size:20"`
	Uid     int64
	Job     string `gorm:"size:50"`
	Content string `gorm:"size:100"`
	Base
}
