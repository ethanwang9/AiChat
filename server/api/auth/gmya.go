package auth

import (
	"errors"
	"fmt"
	"go.uber.org/zap"
	"resty.dev/v3"
	"server/global"
	"server/model"
	"server/utils"
)

type GMYa struct {
	// 接口地址
	URL string
	// 登录平台代码
	Key string
	// 回调地址
	RedirectUrl string
	// 客户端ID
	ClientId string
	// 客户端密钥
	ClientSecret string
	// 登录凭证
	Code string
}

type GMYaLinkResult struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Time int    `json:"time"`
	Data struct {
		Key    string `json:"key"`
		Url    string `json:"url"`
		Width  string `json:"width"`
		Height string `json:"height"`
		State  string `json:"state"`
		Expire int    `json:"expire"`
	} `json:"data"`
}

type GMYaUserinfoResult struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Time int    `json:"time"`
	Data struct {
		App      string `json:"app"`
		Nickname string `json:"nickname"`
		Avatar   string `json:"avatar"`
		Openid   string `json:"openid"`
	} `json:"data"`
}

// New 初始化
func (a GMYa) New(gmya GMYa) GMYa {
	// 获取数据库关于OAuth配置
	sysInfo, err := model.SystemApp.New(model.System{}).Get()
	if err != nil {
		return GMYa{}
	}

	// 返回数据
	return GMYa{
		URL:          "https://account.gmya.net",
		Key:          "wechat_mp",
		RedirectUrl:  fmt.Sprintf("%s/v1/auth/back", global.SysDomain),
		ClientId:     sysInfo.LoginAppid,
		ClientSecret: sysInfo.LoginKey,
		Code:         gmya.Code,
	}
}

// GetLink 获取登录链接
func (a GMYa) GetLink() (*GMYaLinkResult, string, error) {
	// 初始化请求
	client := resty.New()
	defer client.Close()

	// 获取id
	uuid, _ := utils.ToolApp.UUID()

	// 发起请求
	resp, err := client.R().
		SetContentType("application/x-www-form-urlencoded").
		SetFormData(map[string]string{
			"redirect_url": fmt.Sprintf("%s/%s", a.RedirectUrl, uuid),
			"client_id":    a.ClientId,
		}).
		SetResult(&GMYaLinkResult{}).
		Post(fmt.Sprintf("%s/%s", a.URL, a.Key))
	if err != nil {
		global.APP_LOG.Warn("接口请求失败: auth/gmya", zap.Error(err))
		return nil, "", err
	}

	// 解码参数
	data := resp.Result().(*GMYaLinkResult)
	if data.Code != 1 {
		return nil, "", errors.New(data.Msg)
	}

	//返回数据
	return data, uuid, nil
}

// GetUserinfo 获取用户信息
// 需要主动传入code
func (a GMYa) GetUserinfo() (*GMYaUserinfoResult, error) {
	// 初始化请求
	client := resty.New()
	defer client.Close()

	// 发起请求
	resp, err := client.R().
		SetContentType("application/x-www-form-urlencoded").
		SetFormData(map[string]string{
			"redirect_url":  a.RedirectUrl,
			"client_id":     a.ClientId,
			"client_secret": a.ClientSecret,
			"code":          a.Code,
		}).
		SetResult(&GMYaUserinfoResult{}).
		Post(fmt.Sprintf("%s/api/oauth/openid", a.URL))
	if err != nil {
		global.APP_LOG.Warn("接口请求失败: auth/gmya", zap.Error(err))
		return nil, err
	}

	// 解码参数
	data := resp.Result().(*GMYaUserinfoResult)
	if data.Code != 1 {
		return nil, errors.New(data.Msg)
	}

	//返回数据
	return data, nil
}
