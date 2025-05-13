package internal

import (
	"github.com/gin-gonic/gin"
	"server/controller/admin"
)

func Admin(group *gin.RouterGroup, path string) {
	r := group.Group(path)
	{
		// ===
		// 用户信息
		// ===
		// 获取用户信息
		r.GET("/userinfo", admin.GetAdminUserinfo)
		// 更新用户信息
		r.PUT("/userinfo", admin.UpdateAdminUserinfo)
		// 注销账号
		r.DELETE("/userinfo", admin.DeleteAdminUserinfo)

		// ===
		// 用户历史记录
		// ===
		// 获取历史记录
		r.GET("/history", admin.GetAdminHistory)
		// 获取用户指定历史记录
		r.GET("/history/:id", admin.GetAdminHistoryGroupID)
		// 删除用户全部历史记录
		r.DELETE("/history", admin.DeleteAdminHistory)
		// 删除用户指定记录
		r.DELETE("/history/:id", admin.DeleteAdminHistoryGroupID)

		// ===
		// 管理员系统设置
		// ===
		// 获取系统管理配置
		r.GET("/manager/system", admin.GetAdminManagerSystem)

		// ===
		// 日志管理
		// ===
		// 获取日志
		r.GET("/log", admin.GetAdminManagerLog)
		// 删除日志
		r.DELETE("/log/:id", admin.DeleteAdminLog)

		// ===
		// 模型管理
		// ===
		// 获取模型通道
		r.GET("/model/channel", admin.GetAdminModelChannel)
		// 获取模型数据
		r.GET("/model/list", admin.GetAdminModelList)
		// 更新模型通道
		r.PUT("/model/channel", admin.UpdateAdminModelChannel)
		// 更新模型数据
		r.PUT("/model/list", admin.UpdateAdminModelList)
		// 删除模型通道
		r.DELETE("/model/channel", admin.DeleteAdminModelChannel)
		// 删除模型列表
		r.DELETE("/model/list", admin.DeleteAdminModelList)
		// 添加模型通道
		r.POST("/model/channel", admin.PostAdminModelChannel)
		// 添加模型列表
		r.POST("/model/list", admin.PostAdminModelList)

		// ===
		// 智能体
		// ===
		// 创建智能体
		r.POST("/agent", admin.PostAdminAgent)
		// 获取智能体
		r.GET("/agent", admin.GetAdminAgent)
		// 删除智能体
		r.DELETE("/agent", admin.DeleteAdminAgent)
		// 更新智能体
		r.PUT("/agent", admin.PutAdminAgent)

		// ===
		// 对话
		// ===
		// 获取对话历史记录
		r.GET("/chat/history", admin.GetAdminChatHistory)
		// 删除对话历史记录
		r.DELETE("/chat/history", admin.DeleteAdminChatHistory)
		// 获取智能体记录
		r.GET("/chat/agent", admin.GetAdminChatAgent)
		// 删除智能体历史记录
		r.DELETE("/chat/agent", admin.DeleteAdminChatAgent)
		// 获取擂台记录
		r.GET("/chat/pk", admin.GetAdminChatPk)
		// 删除擂台历史记录
		r.DELETE("/chat/pk", admin.DeleteAdminChatPk)

		// ===
		// 系统设置
		// ===
		// 获取系统配置
		r.GET("/system/config", admin.GetAdminSystemConfig)
		// 更新系统配置
		r.PUT("/system/config", admin.UpdateAdminSystemConfig)
		// 获取系统登录配置
		r.GET("/system/auth", admin.GetAdminSystemAuth)
		// 更新系统登录配置
		r.PUT("/system/auth", admin.UpdateAdminSystemAuth)

		// ===
		// 用户管理
		// ===
		// 获取用户信息列表
		r.GET("/user", admin.GetAdminUserinfoList)
		// 更新用户信息
		r.PUT("/user", admin.UpdateAdminUserinfoList)
		// 删除用户信息
		r.DELETE("/user/:id", admin.DeleteAdminUserinfoList)

		// ===
		// 仪表盘
		// ===
		// 获取基础数据
		r.GET("/panel/base", admin.GetAdminPanelBase)
		// 获取对话趋势
		r.GET("/panel/chat", admin.GetAdminPanelChat)
		// 获取Token趋势
		r.GET("/panel/token", admin.GetAdminPanelToken)
	}
}
