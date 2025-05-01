package model

type System struct {
	ID         int    `gorm:"primaryKey;"`
	Logo       string `gorm:"size:200"`
	Name       string `gorm:"size:20"`
	Icp        string `gorm:"size:30"`
	Gov        string `gorm:"size:30"`
	LoginURL   string `gorm:"column:login_url;size:200"`
	LoginAppid string `gorm:"column:login_appid;size:20"`
	LoginKey   string `gorm:"column:login_key;size:32"`
	Base
}
