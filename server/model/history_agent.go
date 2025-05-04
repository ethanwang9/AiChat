package model

type HistoryAgent struct {
	ID       string `gorm:"primaryKey"`
	Uid      int64
	Aid      int
	Question string
	Answer   string
	Base
}

// HistoryAgentApp 实例化
var HistoryAgentApp = new(HistoryAgent)

// New 初始化
func (d *HistoryAgent) New(s HistoryAgent) *HistoryAgent {
	return &s
}
