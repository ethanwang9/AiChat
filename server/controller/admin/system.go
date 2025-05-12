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
)

// GetAdminSystemConfig 获取系统配置
func GetAdminSystemConfig(ctx *gin.Context) {
	// 获取数据
	config, err := model.SystemApp.New(model.System{}).Get()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取系统配置失败",
		})
		return
	}

	// 格式化logo地址
	if len(config.Logo) > 0 {
		config.Logo = global.SysDomain + config.Logo
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"logo": config.Logo,
			"name": config.Name,
			"gov":  config.Gov,
			"icp":  config.Icp,
		},
	})
}

// UpdateAdminSystemConfig 更新系统配置
func UpdateAdminSystemConfig(ctx *gin.Context) {
	// 获取参数
	name := ctx.PostForm("name")
	icp := ctx.PostForm("icp")
	gov := ctx.PostForm("gov")
	logo, _ := ctx.FormFile("logo")
	if len(name) == 0 || len(icp) == 0 || len(gov) == 0 {
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
	avatarFilePath := ""
	if logo != nil && logo.Size > 0 {
		u, _ := utils.ToolApp.UUID()
		avatarFilePath = fmt.Sprintf("%v/agent/%v%v", global.AssetsPath, u, path.Ext(logo.Filename))
		err = ctx.SaveUploadedFile(logo, avatarFilePath)
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorSys,
				Message: "保存图片失败",
			})
			return
		}
		avatarFilePath = avatarFilePath[1:]
	}

	// 更新数据
	if len(avatarFilePath) > 0 {
		err = model.SystemApp.New(model.System{
			Name: name,
			Gov:  gov,
			Icp:  icp,
			Logo: avatarFilePath,
		}).Update()
	} else {
		err = model.SystemApp.New(model.System{
			Name: name,
			Gov:  gov,
			Icp:  icp,
		}).Update()
	}
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
		Job:     "更新系统配置",
		Content: fmt.Sprintf("用户%d更新了系统配置", result.UID),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}
