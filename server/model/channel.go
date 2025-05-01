package model

type Channel struct {
	ID    int     `gorm:"primaryKey;autoIncrement"`
	Name  string  `gorm:"size:20"`
	URL   string  `gorm:"size:100"`
	Key   string  `gorm:"size:50"`
	Money float64 `gorm:"type:decimal(10,2)"`
	Base
}
