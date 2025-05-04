package model

type Channel struct {
	ID    int `gorm:"primaryKey;autoIncrement"`
	Name  string
	URL   string
	Key   string
	Money float64 `gorm:"type:decimal(10,2)"`
	Base
}

// ChannelApp 实例化
var ChannelApp = new(Channel)

// New 初始化
func (d *Channel) New(s Channel) *Channel {
	return &s
}
