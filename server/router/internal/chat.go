package internal

import (
	"github.com/gin-gonic/gin"
	"server/controller/chat"
)

func Chat(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		// ===
		// 对话
		// ===
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

		// ===
		// 擂台
		// ===
		// 上报擂台对话记录
		r.POST("/pk/history", chat.PostChatPKHistory)

		// ===
		// 智能体
		// ===
		// 获取智能体分类
		r.GET("/agent/category", chat.GetChatAgentCategory)
		// 获取智能体列表
		r.GET("/agent/list", chat.GetChatAgentList)
		// 获取指定智能体信息
		r.GET("/agent/:id", chat.GetChatAgentID)
		// 上报智能体对话记录
		r.POST("/agent", chat.PostChatAgent)

	}
}
