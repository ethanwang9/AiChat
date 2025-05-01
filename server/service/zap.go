package service

import (
	"fmt"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
	"server/global"
	"server/service/internal"
	"server/utils"
)

func Zap() (logger *zap.Logger) {
	// 判断是否有Director文件夹
	if ok, _ := utils.PathExists(global.LogPath); !ok {
		fmt.Printf("[初始化] 创建 %v 目录\n", global.LogPath)
		_ = os.Mkdir(global.LogPath, os.ModePerm)
	}

	// zap 选项
	cores := internal.Zap.GetZapCores()

	// 创建 zap
	logger = zap.New(zapcore.NewTee(cores...))
	return logger
}
