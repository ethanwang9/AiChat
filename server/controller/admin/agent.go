package admin

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"server/global"
	"server/model"
	"server/service"
	"server/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// PostAdminAgent 创建智能体
func PostAdminAgent(ctx *gin.Context) {
	// 获取参数
	name := ctx.PostForm("name")
	description := ctx.PostForm("description")
	prompt := ctx.PostForm("prompt")
	temperature := ctx.PostForm("temperature")
	avatar, _ := ctx.FormFile("avatar")
	category := ctx.PostForm("category")

	if len(name) == 0 || len(description) == 0 || len(prompt) == 0 || len(temperature) == 0 || len(category) == 0 || avatar.Size == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, _ := service.JwtToken.Decode(tokenString)
	state, _ := token.GetIssuer()

	// 获取缓存信息
	cacheInfo, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusinessToken,
			Message: "令牌无效，请重新登录",
		})
		return
	case err != nil:
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取缓存信息失败，" + err.Error(),
		})
		return
	}
	var result global.RedisAuthMessage
	_ = json.Unmarshal([]byte(cacheInfo), &result)

	// 写入头像地址
	u, _ := utils.ToolApp.UUID()
	avatarFilePath := fmt.Sprintf("%v/agent/%v%v", global.AssetsPath, u, path.Ext(avatar.Filename))
	err = ctx.SaveUploadedFile(avatar, avatarFilePath)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "保存图片失败, Error: " + err.Error(),
		})
		return
	}

	// 写入数据库
	temperatureN, _ := strconv.ParseFloat(temperature, 32)
	err = model.AgentApp.New(model.Agent{
		Name:        name,
		Description: description,
		Prompt:      prompt,
		Temperature: float32(temperatureN),
		Avatar:      avatarFilePath[1:],
		Category:    category,
	}).Set()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "创建智能体失败, 请再次重试！",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "添加智能体",
		Content: fmt.Sprintf("添加智能体：%s", name),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// GetAdminAgent 获取智能体
func GetAdminAgent(ctx *gin.Context) {
	// 获取参数
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	if len(limit) == 0 || len(offset) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取数据
	limitN, _ := strconv.Atoi(limit)
	offsetN, _ := strconv.Atoi(offset)
	agent, err := model.AgentApp.New(model.Agent{}).GetLimit(limitN, (offsetN-1)*limitN)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
		return
	}

	// 处理数据
	for i, v := range agent {
		agent[i].Avatar = global.SysDomain + v.Avatar
	}

	// 获取总数
	total, err := model.AgentApp.New(model.Agent{}).Count()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败，" + err.Error(),
		})
		return
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"agent": agent,
			"total": total,
		},
	})
}

// DeleteAdminAgent 删除智能体
func DeleteAdminAgent(ctx *gin.Context) {
	// 获取参数
	body, _ := ctx.GetRawData()
	params, _ := url.ParseQuery(string(body))
	id := params.Get("id")

	if len(id) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "参数不正确",
		})
		return
	}

	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, _ := service.JwtToken.Decode(tokenString)
	state, _ := token.GetIssuer()

	// 获取缓存信息
	cacheInfo, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusinessToken,
			Message: "令牌无效，请重新登录",
		})
		return
	case err != nil:
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取缓存信息失败，" + err.Error(),
		})
		return
	}
	var result global.RedisAuthMessage
	_ = json.Unmarshal([]byte(cacheInfo), &result)

	// 删除数据
	idN, _ := strconv.ParseInt(id, 10, 64)
	err = model.AgentApp.New(model.Agent{ID: idN}).Delete()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "删除数据失败，" + err.Error(),
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "删除智能体",
		Content: fmt.Sprintf("删除智能体ID：%s", id),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// PutAdminAgent 更新智能体
func PutAdminAgent(ctx *gin.Context) {
	// 获取参数
	id := ctx.PostForm("id")
	name := ctx.PostForm("name")
	description := ctx.PostForm("description")
	prompt := ctx.PostForm("prompt")
	temperature := ctx.PostForm("temperature")
	avatar, _ := ctx.FormFile("avatar")
	category := ctx.PostForm("category")

	if len(id) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, _ := service.JwtToken.Decode(tokenString)
	state, _ := token.GetIssuer()

	// 获取缓存信息
	cacheInfo, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusinessToken,
			Message: "令牌无效，请重新登录",
		})
		return
	case err != nil:
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取缓存信息失败，" + err.Error(),
		})
		return
	}
	var result global.RedisAuthMessage
	_ = json.Unmarshal([]byte(cacheInfo), &result)

	// 写入头像地址
	var avatarFilePath string
	if avatar.Size > 0 {
		u, _ := utils.ToolApp.UUID()
		avatarFilePath = fmt.Sprintf("%v/agent/%v%v", global.AssetsPath, u, path.Ext(avatar.Filename))
		err = ctx.SaveUploadedFile(avatar, avatarFilePath)
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusiness,
				Message: "保存图片失败, Error: " + err.Error(),
			})
			return
		}
		avatarFilePath = avatarFilePath[1:]
	}

	// 更新数据
	idN, _ := strconv.ParseInt(id, 10, 64)
	temperatureN, _ := strconv.ParseFloat(temperature, 32)
	err = model.AgentApp.New(model.Agent{
		ID:          idN,
		Name:        name,
		Description: description,
		Prompt:      prompt,
		Temperature: float32(temperatureN),
		Avatar:      avatarFilePath,
		Category:    category,
	}).Update()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "更新数据失败，" + err.Error(),
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "更新智能体",
		Content: fmt.Sprintf("删除智能体ID：%s", "id"),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}
