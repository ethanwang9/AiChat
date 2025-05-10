package bigModel

import (
	"context"
	"github.com/sashabaranov/go-openai"
)

// OpenAI openai通用接口类型请求
type OpenAI struct {
	BaseUrl   string
	ApiKey    string
	ModelName string
}

// New 初始化
func (a *OpenAI) New(o OpenAI) *OpenAI {
	return &o
}

// 初始化请求客户端
func (a *OpenAI) initClient() *openai.Client {
	config := openai.DefaultConfig(a.ApiKey)
	config.BaseURL = a.BaseUrl
	return openai.NewClientWithConfig(config)
}

// ChatStream 流式对话
func (a *OpenAI) ChatStream(message []openai.ChatCompletionMessage, temperature float32) (*openai.ChatCompletionStream, error) {
	// 初始化
	client := a.initClient()
	ctx := context.Background()
	req := openai.ChatCompletionRequest{
		Model:       a.ModelName,
		Messages:    message,
		Stream:      true,
		Temperature: temperature,
	}

	// 构建请求
	stream, err := client.CreateChatCompletionStream(ctx, req)
	if err != nil {
		return nil, err
	}

	// 返回stream对象
	return stream, nil
}
