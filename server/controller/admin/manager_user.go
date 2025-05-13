package admin

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"path"
	"server/global"
	"server/model"
	"server/service"
	"server/utils"
	"strconv"

	"github.com/redis/go-redis/v9"

	"github.com/gin-gonic/gin"
)

// GetAdminUserinfoList 获取用户信息列表
func GetAdminUserinfoList(ctx *gin.Context) {
	// 获取参数
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	uid := ctx.Query("uid")
	name := ctx.Query("name")

	if len(limit) == 0 || len(offset) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "参数不正确",
		})
		return
	}

	// 获取用户数据
	uidN, _ := strconv.ParseInt(uid, 10, 64)
	limitN, _ := strconv.Atoi(limit)
	offsetN, _ := strconv.Atoi(offset)
	user, err := model.UserApp.New(model.User{
		Uid:  uidN,
		Name: name,
	}).GetLimitAndSearch(limitN, (offsetN-1)*limitN)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败",
		})
		return
	}

	// 格式化用户头像信息
	for i, v := range user {
		user[i].Avatar = global.SysDomain + v.Avatar
	}

	// 获取用户数据总数
	total, err := model.UserApp.New(model.User{
		Uid:  uidN,
		Name: name,
	}).GetLimitAndSearchTotal()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败",
		})
		return
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"user":  user,
			"total": total,
		},
	})
}

// UpdateAdminUserinfoList 更新用户信息列表
func UpdateAdminUserinfoList(ctx *gin.Context) {
	// 获取参数
	uid := ctx.PostForm("uid")
	name := ctx.PostForm("name")
	mail := ctx.PostForm("mail")
	phone := ctx.PostForm("phone")
	avatar, _ := ctx.FormFile("avatar")
	status := ctx.PostForm("status")
	role := ctx.PostForm("role")

	if len(uid) == 0 {
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

	// 更新用户信息
	uidN, _ := strconv.ParseInt(uid, 10, 64)
	err = model.UserApp.New(model.User{
		Uid:    uidN,
		Name:   name,
		Mail:   mail,
		Phone:  phone,
		Avatar: avatarFilePath,
		Status: status,
		Role:   role,
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
		Job:     "更新用户身份信息",
		Content: fmt.Sprintf("管理员维护uid（%d）的身份信息", result.UID),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// DeleteAdminUserinfoList 删除用户信息
func DeleteAdminUserinfoList(ctx *gin.Context) {
	// 获取参数
	uid := ctx.Param("id")

	if len(uid) == 0 {
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

	// 写入数据
	uidN, _ := strconv.ParseInt(uid, 10, 64)
	err = model.UserApp.New(model.User{Uid: uidN}).ForceDelete()
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
		Job:     "删除用户账号",
		Content: fmt.Sprintf("管理员永久删除了用户账号（UID：%s）", uid),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}
