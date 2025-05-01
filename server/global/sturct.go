package global

// MsgBack 消息返回接口
type MsgBack struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}
