package utils

import (
	srand "crypto/rand"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"math/big"
	"math/rand"
	"server/global"
	"strings"
	"time"
)

type Tool struct{}

var ToolApp = new(Tool)

// UUID 生成UUID
func (t Tool) UUID() (result string, err error) {
	u, err := uuid.NewUUID()
	if err != nil {
		global.APP_LOG.Warn("生成uuid失败", zap.Error(err))
		return
	}
	return strings.Replace(u.String(), "-", "", -1), nil
}

// RandString 随机字符串, 0-9 a-z A-Z
func (t Tool) RandString(length int) string {
	// 定义字符集
	const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	const charsetLength = len(charset)

	// 创建一个字节切片用于存储随机字符
	result := make([]byte, length)

	// 生成随机字符
	for i := 0; i < length; i++ {
		// 生成一个随机数，范围是 [0, charsetLength)
		randomIndex, _ := srand.Int(srand.Reader, big.NewInt(int64(charsetLength)))
		// 从字符集中选择一个字符
		result[i] = charset[randomIndex.Int64()]
	}

	return string(result)
}

// RandStr 随机字符串, a-z
func (t Tool) RandStr(length int) string {
	// 定义字符集
	const charset = "abcdefghijklmnopqrstuvwxyz"
	const charsetLength = len(charset)

	// 创建一个字节切片用于存储随机字符
	result := make([]byte, length)

	// 生成随机字符
	for i := 0; i < length; i++ {
		// 生成一个随机数，范围是 [0, charsetLength)
		randomIndex, _ := srand.Int(srand.Reader, big.NewInt(int64(charsetLength)))
		// 从字符集中选择一个字符
		result[i] = charset[randomIndex.Int64()]
	}

	return string(result)
}

// RandNumber 随机数字 0-9
func (t Tool) RandNumber(length int) string {
	// 码表
	const charset = "0123456789"

	// 随机数字符串
	randByte := make([]byte, length)

	// 生成随机数
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := range randByte {
		randByte[i] = charset[r.Intn(len(charset))]
	}

	return string(randByte)
}
