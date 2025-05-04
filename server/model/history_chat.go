package model

type HistoryChat struct {
	ID       string `gorm:"primaryKey"`
	Uid      int64
	GroupID  string `gorm:"column:group_id"`
	Title    string
	Question string
	Answer   string
	Base
}

// HistoryChatApp 实例化
var HistoryChatApp = new(HistoryChat)

// New 初始化
func (d *HistoryChat) New(s HistoryChat) *HistoryChat {
	return &s
}
