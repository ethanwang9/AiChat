package model

type HistoryAgent struct {
	ID       string `gorm:"primaryKey;size:32"`
	Uid      int64
	Aid      int
	Question string `gorm:"size:200"`
	Answer   string `gorm:"size:1000"`
	Base
}
