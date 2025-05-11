package admin

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"server/global"
	"server/model"
	"server/service"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// GetAdminModelChannel 获取模型通道
func GetAdminModelChannel(ctx *gin.Context) {
	// 获取参数
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	if len(limit) == 0 || len(offset) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
			Data:    nil,
		})
		return
	}

	// 获取分页数据
	limitN, _ := strconv.Atoi(limit)
	offsetN, _ := strconv.Atoi(offset)
	data, err := model.ChannelApp.New(model.Channel{}).GetLimit(limitN, (offsetN-1)*limitN)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败",
		})
		return
	}

	// 获取数量
	count, err := model.ChannelApp.New(model.Channel{}).Count()
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
			"channel": data,
			"total":   count,
		},
	})
}

// GetAdminModelList 获取模型数据
func GetAdminModelList(ctx *gin.Context) {
	// 获取参数
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	if len(limit) == 0 || len(offset) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "请求参数不正确",
			Data:    nil,
		})
		return
	}

	// 获取分页数据
	limitN, _ := strconv.Atoi(limit)
	offsetN, _ := strconv.Atoi(offset)
	data, err := model.ModelApp.New(model.Model{}).GetLimit(limitN, (offsetN-1)*limitN)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取数据失败",
		})
		return
	}

	// 获取数量
	count, err := model.ModelApp.New(model.Model{}).Count()
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
			"list":  data,
			"total": count,
		},
	})
}

// UpdateAdminModelList 更新模型数据
func UpdateAdminModelList(ctx *gin.Context) {
	// 获取参数
	body, _ := ctx.GetRawData()
	params, _ := url.ParseQuery(string(body))
	id := params.Get("id")
	cid := params.Get("cid")
	name := params.Get("name")
	nickname := params.Get("nickname")
	status := params.Get("status")

	if len(id) == 0 || len(cid) == 0 || len(name) == 0 || len(nickname) == 0 || len(status) == 0 {
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

	// 更新数据
	idN, _ := strconv.Atoi(id)
	cidN, _ := strconv.Atoi(cid)
	err = model.ModelApp.New(model.Model{
		ID:       idN,
		Cid:      cidN,
		Name:     name,
		Nickname: nickname,
		Status:   status,
	}).UpdateID()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "更新数据失败，请再次重试！",
		})
		return
	}

	// 写入日志
	model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "更新模型通道",
		Content: fmt.Sprintf("更新模型ID：%s", id),
		Base:    model.Base{},
	})

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// UpdateAdminModelChannel 更新模型通道
func UpdateAdminModelChannel(ctx *gin.Context) {
	// 获取参数
	body, _ := ctx.GetRawData()
	params, _ := url.ParseQuery(string(body))
	id := params.Get("id")
	name := params.Get("name")
	urlValue := params.Get("url")
	key := params.Get("key")

	if len(id) == 0 || len(name) == 0 || len(urlValue) == 0 || len(key) == 0 {
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

	// 更新数据
	idN, _ := strconv.Atoi(id)
	err = model.ChannelApp.New(model.Channel{
		ID:   idN,
		Name: name,
		URL:  urlValue,
		Key:  key,
	}).UpdateID()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "更新数据失败，请再次重试！",
		})
		return
	}

	// 写入日志
	model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "更新模型通道",
		Content: fmt.Sprintf("更新模型通道ID：%s", id),
		Base:    model.Base{},
	})

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// DeleteAdminModelChannel 删除模型通道
func DeleteAdminModelChannel(ctx *gin.Context) {
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
	// 判断如果通道下有模型禁止删除
	idN, _ := strconv.Atoi(id)
	cid, err := model.ModelApp.New(model.Model{Cid: idN}).GetCID()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "事务处理失败，请再次重试！",
		})
		return
	}
	if len(cid) > 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "通道下有模型，请删除模型后在删除通道",
		})
		return
	}
	// 删除通道
	err = model.ChannelApp.New(model.Channel{ID: idN}).Delete()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "删除失败，请再次重试！",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "删除模型通道",
		Content: fmt.Sprintf("删除模型通道ID：%s", id),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// DeleteAdminModelList 删除模型列表
func DeleteAdminModelList(ctx *gin.Context) {
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

	// 删除模型
	idN, _ := strconv.Atoi(id)
	err = model.ModelApp.New(model.Model{ID: idN}).Delete()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "删除失败，请再次重试！",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "删除模型列表",
		Content: fmt.Sprintf("删除模型列表ID：%s", id),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// PostAdminModelChannel 添加模型通道
func PostAdminModelChannel(ctx *gin.Context) {
	// 获取参数
	name := ctx.PostForm("name")
	urlValue := ctx.PostForm("url")
	key := ctx.PostForm("key")

	if len(name) == 0 || len(urlValue) == 0 || len(key) == 0 {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "参数不正确",
		})
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
	err = model.ChannelApp.New(model.Channel{
		Name: name,
		URL:  urlValue,
		Key:  key,
	}).Set()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "写入数据失败，请再次重试！",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "添加模型通道",
		Content: fmt.Sprintf("创建通道：%s", name),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}

// PostAdminModelList 添加模型列表
func PostAdminModelList(ctx *gin.Context) {
	// 获取参数
	cid := ctx.PostForm("cid")
	name := ctx.PostForm("name")
	nickname := ctx.PostForm("nickname")
	status := ctx.PostForm("status")

	if len(cid) == 0 || len(name) == 0 || len(nickname) == 0 || len(status) == 0 {
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

	// 写入数据
	cidN, _ := strconv.Atoi(cid)
	err = model.ModelApp.New(model.Model{
		Cid:      cidN,
		Name:     name,
		Nickname: nickname,
		Status:   status,
	}).Set()
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "写入数据失败，请再次重试！",
		})
		return
	}

	// 写入日志
	_ = model.LogApp.New(model.Log{
		Operate: "用户操作",
		Uid:     result.UID,
		Job:     "添加模型列表",
		Content: fmt.Sprintf("创建模型：%s", name),
	}).Set()

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
	})
}
