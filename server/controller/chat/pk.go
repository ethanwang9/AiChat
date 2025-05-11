package chat

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"net/http"
	"server/global"
	"server/model"
	"server/service"
	"strconv"
)

func PostChatPKHistory(ctx *gin.Context) {
	// 获取参数
	mid1 := ctx.PostForm("mid1")
	mid2 := ctx.PostForm("mid2")
	question := ctx.PostForm("question")
	answer1 := ctx.PostForm("answer1")
	answer2 := ctx.PostForm("answer2")
	if len(mid1) == 0 || len(mid2) == 0 || len(question) == 0 || len(answer1) == 0 || len(answer2) == 0 {
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

	// 写入数据库
	mid1N, _ := strconv.Atoi(mid1)
	mid2N, _ := strconv.Atoi(mid2)
	err = model.HistoryPkApp.New(model.HistoryPk{
		Uid:      result.UID,
		Mid1:     mid1N,
		Mid2:     mid2N,
		Question: question,
		Answer1:  answer1,
		Answer2:  answer2,
	}).Set()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "写入数据失败，请再次重试！",
		})
		return
	}

	// 返回内容
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}
