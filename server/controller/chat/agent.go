package chat

import (
	"net/http"
	"server/global"
	"server/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetChatAgentCategory 获取智能体分类
func GetChatAgentCategory(ctx *gin.Context) {
	// 获取数据
	category, err := model.AgentApp.New(model.Agent{}).GetCategory()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
	}

	// 处理数据
	data := make([]string, 0)
	for _, v := range category {
		data = append(data, v.Category)
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    data,
	})
}

// GetChatAgentList 获取智能体列表
func GetChatAgentList(ctx *gin.Context) {
	// 获取参数
	category := ctx.Query("category")

	if len(category) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取数据
	agent, err := model.AgentApp.New(model.Agent{Category: category}).GetList(category)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
	}

	// 处理数据
	for i, v := range agent {
		agent[i].Avatar = global.SysDomain + v.Avatar
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    agent,
	})
}

// GetChatAgentID 获取指定智能体信息
func GetChatAgentID(ctx *gin.Context) {
	// 获取参数
	id := ctx.Param("id")
	if len(id) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取数据
	idN, _ := strconv.ParseInt(id, 10, 64)
	agent, err := model.AgentApp.New(model.Agent{ID: idN}).GetID()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
	}

	// 处理数据
	agent.Avatar = global.SysDomain + agent.Avatar

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    agent,
	})
}
