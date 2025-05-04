package model

type Log struct {
	ID      string `gorm:"primaryKey"`
	Operate string
	Uid     int64
	Job     string
	Content string
	Base
}

// LogApp 实例化
var LogApp = new(Log)

// New 初始化
func (d *Log) New(s Log) *Log {
	return &s
}
