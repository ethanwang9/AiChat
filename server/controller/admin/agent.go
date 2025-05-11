package admin

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"net/http"
	"path"
	"server/global"
	"server/model"
	"server/service"
	"server/utils"
	"strconv"
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
	model.AgentApp.New(model.Agent{
		Name:        name,
		Description: description,
		Prompt:      prompt,
		Temperature: float32(temperatureN),
		Avatar:      avatarFilePath[1:],
		Category:    category,
	}).Set()

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
