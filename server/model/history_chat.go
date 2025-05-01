package model

type HistoryChat struct {
	ID       string `gorm:"primaryKey;size:32"`
	Uid      int64
	GroupID  string `gorm:"column:group_id;size:32"`
	Title    string `gorm:"size:20"`
	Question string `gorm:"size:200"`
	Answer   string `gorm:"size:1000"`
	Base
}
