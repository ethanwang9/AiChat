package global

import "time"

// MsgBack 消息返回接口
type MsgBack struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// RedisAuthMessage Redis-授权消息接口
type RedisAuthMessage struct {
	UID    int64     `json:"uid"`
	Openid string    `json:"openid"`
	Status bool      `json:"status"`
	Role   string    `json:"role"`
	Time   time.Time `json:"time"`
}
