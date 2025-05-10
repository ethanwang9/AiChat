package admin

import (
	"errors"
	"fmt"
	"github.com/goccy/go-json"
	"net/http"
	"server/global"
	"server/model"
	"server/service"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func GetAdminUserinfo(ctx *gin.Context) {
	// 获取token
	tokenString := ctx.GetHeader("Authorization")[7:]
	token, err := service.JwtToken.Decode(tokenString)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: err.Error(),
		})
		return
	}
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
