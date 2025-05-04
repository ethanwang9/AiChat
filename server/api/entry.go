package api

import "server/api/auth"

type Api struct {
	auth.GMYa
}

// Application 接口实例
var Application = new(Api)
