package admin

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/goccy/go-json"
	"github.com/redis/go-redis/v9"
	"net/http"
	"path"
	"server/global"
	"server/model"
	"server/service"
	"server/utils"
	"strings"
)

func GetAdminUserinfo(ctx *gin.Context) {
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

	// 获取用户信息
	userinfo, err := model.UserApp.New(model.User{Uid: result.UID}).Get()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取用户信息失败，请再次重试！",
		})
		return
	}

	// 替换用户头像
	if strings.HasPrefix(userinfo.Avatar, "/assets/avatar/") {
		userinfo.Avatar = global.SysDomain + userinfo.Avatar
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"uid":    userinfo.Uid,
			"name":   userinfo.Name,
			"mail":   userinfo.Mail,
			"phone":  userinfo.Phone,
			"avatar": userinfo.Avatar,
		},
	})
}

// UpdateAdminUserinfo 更新用户信息
func UpdateAdminUserinfo(ctx *gin.Context) {
	// 获取参数
	avatar, _ := ctx.FormFile("avatar")
	if avatar.Size <= 0 {
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
		avatarFilePath = fmt.Sprintf("%v/avatar/%v%v", global.AssetsPath, u, path.Ext(avatar.Filename))
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
	err = model.UserApp.New(model.User{
		Uid:    result.UID,
		Avatar: avatarFilePath,
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
		Job:     "更新头像",
		Content: "用户更新头像地址成功",
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// DeleteAdminUserinfo 删除账号
func DeleteAdminUserinfo(ctx *gin.Context) {
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

	// 写入更新用户账号状态
	err = model.UserApp.New(model.User{Uid: result.UID, Status: "destroy"}).Update()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "更新账号状态失败",
		})
		return
	}

	// 删除用户账号
	err = model.UserApp.New(model.User{Uid: result.UID}).Delete()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "注销账号失败，请再次重试！",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "删除账号",
		Content: fmt.Sprintf("用户主动注销账号，UID：%d", result.UID),
	}).Set()

	// 返回消息
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}
