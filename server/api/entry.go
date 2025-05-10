package api

import (
	"server/api/auth"
	"server/api/bigModel"
)

type Api struct {
	auth.GMYa
	bigModel.OpenAI
}

// Application 接口实例
var Application = new(Api)
