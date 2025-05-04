package model

type Model struct {
	ID       int `gorm:"primaryKey;autoIncrement"`
	Cid      int
	Name     string
	Category string
	Status   string `gorm:"default:'use'"`
	Base
}

// ModelApp 实例化
var ModelApp = new(Model)

// New 初始化
func (d *Model) New(s Model) *Model {
	return &s
}
