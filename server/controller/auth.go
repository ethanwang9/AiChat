package controller

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"server/api"
	"server/api/auth"
	"server/global"
	"server/model"
	"server/service"
	"strings"
	"time"
)

// GetAuthLogin 获取登录信息
func GetAuthLogin(ctx *gin.Context) {
	// 获取登录链接
	linkData, uuid, err := api.Application.GMYa.New(auth.GMYa{}).GetLink()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: err.Error(),
		})
		return
	}

	// 存储会话
	marshal, _ := json.Marshal(global.RedisAuthMessage{Status: false})
	err = global.APP_REDIS.Set(ctx, "Login#"+uuid, string(marshal), time.Duration(linkData.Data.Expire)*time.Second).Err()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: err.Error(),
		})
		return
	}

	// 返回消息
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"id":   uuid,
			"link": linkData.Data.Url,
		},
	})
}

// GetAuthBack 获取授权Code
func GetAuthBack(ctx *gin.Context) {
	// 获取参数
	state := ctx.Param("state")
	code := ctx.Query("code")

	// 判断参数
	if len(state) == 0 || len(code) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数错误",
		})
		return
	}

	// 获取社交用户信息
	social, err := api.Application.GMYa.New(auth.GMYa{Code: code}).GetUserinfo()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: err.Error(),
		})
		return
	}

	// 获取系统绑定数据
	bind, err := model.AccountBindApp.New(model.AccountBind{Wechat: social.Data.Openid}).GetWechat()
	if err == nil && bind.Uid == 0 {
		// 用户不存在，创建用户
		// 1. 判断是否为管理员
		count, err := model.UserApp.New(model.User{}).Count()
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorSQL,
				Message: "处理数据发生错误，请再次重试！",
			})
			return
		}
		var role string = "user"
		if count == 0 {
			role = "admin"
		}
		// 2. 写入用户
		user2, err := model.UserApp.New(model.User{
			Name:   social.Data.Nickname,
			Avatar: social.Data.Avatar,
			Role:   role,
		}).Set()
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorSQL,
				Message: "处理数据发生错误，请再次重试！",
			})
			return
		}
		// 3. 绑定用户社交账号信息
		err = model.AccountBindApp.New(model.AccountBind{
			Uid:    user2.Uid,
			Wechat: social.Data.Openid,
		}).Set()
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorSQL,
				Message: "处理数据发生错误，请再次重试！",
			})
			return
		}
		// 4. 修改变量信息
		bind.Uid = user2.Uid
		bind.Wechat = social.Data.Openid
	} else if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "查询数据发生错误",
		})
		return
	}

	// 获取用户身份
	user, err := model.UserApp.New(model.User{Uid: bind.Uid}).Get()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "查询数据发生错误",
		})
		return
	}

	// 判断用户是否能够登录
	if user.Status != "use" {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "账号状态异常，请联系管理员解决",
		})
		return
	}

	// 替换用户头像
	avatar := user.Avatar
	if strings.HasPrefix(user.Avatar, "/assets/avatar/") {
		avatar = global.SysDomain + user.Avatar
	}

	// 写入缓存数据库
	rdbValue := global.RedisAuthMessage{
		Status: true,
		UID:    bind.Uid,
		Role:   user.Role,
		Openid: bind.Wechat,
		Avatar: avatar,
		Time:   time.Now(),
	}
	rdbValueString, _ := json.Marshal(rdbValue)
	if global.APP_REDIS.Set(ctx, "Login#"+state, string(rdbValueString), time.Hour*4).Err() != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "写入登录令牌失败，请再次重试！",
		})
	}

	ctx.String(http.StatusOK, "登录成功！")
}

func GetAuthCheck(ctx *gin.Context) {
	// 获取请求参数
	state := ctx.Query("state")
	if len(state) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
		})
		return
	}

	// 获取缓存服务器 Login#state 数据
	result, err := global.APP_REDIS.Get(ctx, "Login#"+state).Result()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "查询数据失败，Error: " + err.Error(),
		})
		return
	}
	var data global.RedisAuthMessage
	_ = json.Unmarshal([]byte(result), &data)

	// 生成token
	var token string = ""
	if data.Status {
		token, err = service.JwtToken.Generate(state, data.Time.Add(4*time.Hour))
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusiness,
				Message: "生成令牌失败，Error: " + err.Error(),
			})
			return
		}
	}

	// 记录日志
	_ = model.LogApp.New(model.Log{
		Operate: "权限认证",
		Uid:     data.UID,
		Job:     "登录账号",
		Content: fmt.Sprintf("用户在IP地址（%s）登录", ctx.ClientIP()),
		Base:    model.Base{},
	}).Set()

	// 返回token
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"status": data.Status,
			"token":  token,
			"avatar": data.Avatar,
			"role":   data.Role,
		},
	})
}
