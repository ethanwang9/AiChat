package middleware

import (
	"github.com/gin-gonic/gin"
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
			"^/temp/.+",
			"^/auth/.+",
		}
		for i := range path {
			re := regexp.MustCompile(path[i])
			if re.MatchString(ctx.Request.URL.Path) {
				ctx.Next()
				return
			}
		}

		// 解析 token
		_, err := service.JwtToken.Decode(tokenString)
		if err != nil {
			ctx.JSON(http.StatusOK, global.MsgBack{
				Code:    global.StatusErrorBusinessToken,
				Message: err.Error(),
				Data:    nil,
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
