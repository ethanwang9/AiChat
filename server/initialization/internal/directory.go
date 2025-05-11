package internal

import (
	"fmt"
	"os"
	"server/global"
	"server/utils"
)

// DirectoryInit 初始化系统目录
func DirectoryInit() {
	mkdirAssets()
}

// 创建资源目录
func mkdirAssets() {
	if ok, _ := utils.PathExists(global.AssetsPath); !ok {
		fmt.Printf("[初始化] 创建 %v 目录\n", global.AssetsPath)
		_ = os.Mkdir(global.AssetsPath, os.ModePerm)
	}

	p := []string{
		global.AssetsPath + "/avatar",
		global.AssetsPath + "/system",
		global.AssetsPath + "/agent",
	}
	for _, v := range p {
		if ok, _ := utils.PathExists(v); !ok {
			fmt.Printf("[初始化] 创建 %v 目录\n", v)
			_ = os.Mkdir(v, os.ModePerm)
		}
	}
}
