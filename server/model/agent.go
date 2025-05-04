package model

type Agent struct {
	ID          int64 `gorm:"primaryKey;autoIncrement"`
	Name        string
	Description string
	Prompt      string
	Temperature float32
	Avatar      string
	Category    string
	Base
}

// AgentApp 实例化
var AgentApp = new(Agent)

// New 初始化
func (d *Agent) New(s Agent) *Agent {
	return &s
}
