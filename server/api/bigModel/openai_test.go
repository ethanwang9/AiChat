package bigModel

import (
	"errors"
	"fmt"
	"github.com/sashabaranov/go-openai"
	"io"
	"testing"
)

func TestOpenAI_ChatStream(t *testing.T) {
	// 初始化
	o := new(OpenAI)
	client := o.New(OpenAI{
		BaseUrl:   "https://api.deepseek.com",
		ApiKey:    "sk-1178d6de244e47f6a167ce796c9cdd14",
		ModelName: "deepseek-reasoner",
	})

	// 发起请求
	data, err := client.ChatStream([]openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleUser,
			Content: "我想吃苹果，有什么推荐吗？",
		},
	}, 1)
	if err != nil {
		t.Error(err)
		return
	}
	defer data.Close()

	// 返回数据
	for {
		response, err := data.Recv()
		if errors.Is(err, io.EOF) {
			fmt.Println(response.Usage)
			return
		}

		if err != nil {
			t.Error(err)
			return
		}

		if len(response.Choices[0].Delta.ReasoningContent) > 0 {
			fmt.Print(response.Choices[0].Delta.ReasoningContent)

		} else {
			fmt.Print(response.Choices[0].Delta.Content)
		}
		if response.Usage != nil {
			fmt.Println(response.Usage)
		}
	}
}
