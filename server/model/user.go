package model

type User struct {
	Uid    int64  `gorm:"primaryKey;autoIncrement"`
	Name   string `gorm:"size:20"`
	Mail   string `gorm:"size:50;unique"`
	Phone  string `gorm:"size:12;unique"`
	Avatar string `gorm:"size:100"`
	Status string `gorm:"size:20;default:'use'"`
	Role   string `gorm:"size:30;default:'user'"`
	Base
}
