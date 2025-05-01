package model

type Model struct {
	ID       int `gorm:"primaryKey;autoIncrement"`
	Cid      int
	Name     string `gorm:"size:20"`
	Category string `gorm:"size:50"`
	Status   string `gorm:"size:20;default:'use'"`
	Base
}
