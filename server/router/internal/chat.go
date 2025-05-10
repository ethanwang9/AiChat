package internal

import (
	"github.com/gin-gonic/gin"
	"server/controller/chat"
)

func Chat(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		// 获取模型对话内容
		r.POST("/chat", chat.GetChatChat)
	}
}
