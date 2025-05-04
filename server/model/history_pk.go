package model

type HistoryPk struct {
	ID       string `gorm:"primaryKey"`
	Uid      int64
	Mid1     int
	Mid2     int
	Question string
	Answer   string
	Answer2  string
	Base
}

// HistoryPkApp 实例化
var HistoryPkApp = new(HistoryPk)

// New 初始化
func (d *HistoryPk) New(s HistoryPk) *HistoryPk {
	return &s
}
