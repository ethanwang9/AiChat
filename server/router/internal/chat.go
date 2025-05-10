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
		// 获取模型列表
		r.GET("/model", chat.GetChatModel)
		// 上报对话记录
		r.POST("/history", chat.PostChatHistory)
		// 获取历史对话记录前35条
		r.GET("/history", chat.GetChatHistory)
		// 获取指定历史记录
		r.GET("/history/:id", chat.GetChatHistoryByID)

	}
}
