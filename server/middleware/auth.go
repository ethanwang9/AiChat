package middleware

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"net/http"
	"regexp"
	"server/global"
	"server/service"
	"strings"
)

func AuthVerify() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// 获取jwt
		var tokenString = ctx.GetHeader("Authorization")
		if len(tokenString) != 0 && strings.HasPrefix(tokenString, "Bearer ") {
			tokenString = tokenString[7:]
		} else {
			tokenString = ""
		}

		// 判断不需要登录的路由
		path := []string{
			"^/v1/auth/.+",
			"^/v1/home/.+",
		}
		for i := range path {
			re := regexp.MustCompile(path[i])
			if re.MatchString(ctx.Request.URL.Path) {
				ctx.Next()
				return
			}
		}

		// 解析 token
		token, err := service.JwtToken.Decode(tokenString)
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusinessToken,
				Message: err.Error(),
				Data:    nil,
			})
			ctx.Abort()
			return
		}

		// 获取用户权限等级
		state, err := token.GetIssuer()
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusinessToken,
				Message: err.Error(),
				Data:    nil,
			})
			ctx.Abort()
			return
		}
		result, err := global.APP_REDIS.Get(ctx, fmt.Sprintf("Login#%s", state)).Result()
		switch {
		case errors.Is(err, redis.Nil):
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusinessToken,
				Message: "令牌无效，请再次登录",
				Data:    nil,
			})
			ctx.Abort()
			return
		case err != nil:
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorSQL,
				Message: err.Error(),
				Data:    nil,
			})
			ctx.Abort()
			return
		}
		var userinfo global.RedisAuthMessage
		_ = json.Unmarshal([]byte(result), &userinfo)
		if !userinfo.Status {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusinessToken,
				Message: "令牌状态异常，请再次登录",
				Data:    nil,
			})
			ctx.Abort()
			return
		}

		// 判断用户身份路由
		userPath := []string{
			"^/v1/chat/.+",
			"^/v1/admin/userinfo",
		}
		for i := range userPath {
			re := regexp.MustCompile(userPath[i])
			if re.MatchString(ctx.Request.URL.Path) {
				ctx.Next()
				return
			}

			// 判断管理员身份路由
			adminPath := []string{
				"^/v1/admin/.+",
			}
			for i := range path {
				re := regexp.MustCompile(adminPath[i])
				if re.MatchString(ctx.Request.URL.Path) && userinfo.Role != "admin" {
					ctx.JSON(http.StatusOK, global.MsgBack{
						Code:    global.StatusErrorBusiness,
						Message: "权限不足",
						Data:    nil,
					})
					ctx.Abort()
					return
				}
			}

			ctx.Next()
		}
	}
}
