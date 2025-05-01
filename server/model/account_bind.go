package model

type AccountBind struct {
	ID     int64  `gorm:"primaryKey;autoIncrement"`
	Uid    int64  `gorm:"unique"`
	Wechat string `gorm:"size:32"`
	Base
}
