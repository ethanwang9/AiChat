package admin

import (
	"encoding/json"
	"fmt"
	"github.com/sashabaranov/go-openai"
	"net/http"
	"server/global"
	"server/model"
	"time"

	"github.com/gin-gonic/gin"
)

// GetAdminPanelBase 获取基础数据
func GetAdminPanelBase(ctx *gin.Context) {
	// 获取用户数量
	user, err := model.UserApp.New(model.User{}).CountAll()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取用户数量失败",
		})
		return
	}

	// 获取今日对话数
	todayChat, err := model.HistoryChatApp.New(model.HistoryChat{}).CountToday()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取对话数量失败",
		})
		return
	}
	todayAgent, err := model.HistoryAgentApp.New(model.HistoryAgent{}).CountToday()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取对话数量失败",
		})
		return
	}
	todayPk, err := model.HistoryPkApp.New(model.HistoryPk{}).CountToday()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, global.MsgBack{
			Code:    global.StatusErrorBusiness,
			Message: "获取对话数量失败",
		})
		return
	}
	// 获取今日消耗Token量
	todayToken, err := model.LogApp.New(model.Log{}).TodayTokenCount()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取今日Token数量失败",
		})
		return
	}

	// 获取总Token消耗量
	TatalToken, err := model.LogApp.New(model.Log{}).TokenCount()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取全部Token数量失败",
		})
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data: gin.H{
			"user":        user,
			"today_chat":  todayChat + todayAgent + todayPk,
			"today_token": todayToken,
			"token":       TatalToken,
		},
	})
}

// GetAdminPanelChat 获取对话趋势
func GetAdminPanelChat(ctx *gin.Context) {
	// 获取数据
	start := ctx.Query("start")
	end := ctx.Query("end")
	if len(start) == 0 || len(end) == 0 {
		ctx.JSON(http.StatusOK, gin.H{
			"code":    global.StatusErrorBusiness,
			"message": "参数错误",
		})
		return
	}

	// 获取数据
	rangeChat, err := model.HistoryChatApp.New(model.HistoryChat{}).Range(start, end)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取对话趋势失败",
		})
		return
	}
	rangeAgent, err := model.HistoryAgentApp.New(model.HistoryAgent{}).Range(start, end)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取对话趋势失败",
		})
	}
	rangePk, err := model.HistoryPkApp.New(model.HistoryPk{}).Range(start, end)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取对话趋势失败",
		})
	}
	fmt.Println(rangeChat, rangeAgent, rangePk)

	// 处理数据
	data := make([]model.HistoryRange, 0)
	for _, v := range rangeChat {
		data = append(data, v)
	}
	for _, v := range rangeAgent {
		for i, v2 := range data {
			t1, _ := time.Parse("2006-01-02 15:04:05", v.Date)
			t2, _ := time.Parse("2006-01-02 15:04:05", v2.Date)
			if t1.Format("2006-01-02") == t2.Format("2006-01-02") {
				data[i].Value += v.Value
			}
		}
	}
	for _, v := range rangePk {
		for i, v2 := range data {
			t1, _ := time.Parse("2006-01-02 15:04:05", v.Date)
			t2, _ := time.Parse("2006-01-02 15:04:05", v2.Date)
			if t1.Format("2006-01-02") == t2.Format("2006-01-02") {
				data[i].Value += v.Value
			}

		}
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    data,
	})
}

// GetAdminPanelToken 获取Token趋势
func GetAdminPanelToken(ctx *gin.Context) {
	// 获取数据
	start := ctx.Query("start")
	end := ctx.Query("end")
	if len(start) == 0 || len(end) == 0 {
		ctx.JSON(http.StatusOK, gin.H{
			"code":    global.StatusErrorBusiness,
			"message": "参数错误",
		})
		return
	}

	// 获取数据
	logInfo, err := model.LogApp.New(model.Log{}).RangeLog(start, end)
	if err != nil {
		ctx.JSON(http.StatusOK, global.MsgBack{
			Code:    global.StatusErrorSQL,
			Message: "获取Token趋势失败",
		})
		return
	}

	// 筛选数据
	type ld struct {
		Date  string `json:"date"`
		Value int    `json:"value"`
	}
	date := make([]ld, 0)

	// 遍历日志数据，提取日期和Token数量
	dateMap := make(map[string]int)
	for _, log := range logInfo {
		// 提取日期 YYYY-MM-DD
		dateStr := log.CreatedAt.Format("2006-01-02")

		var usage openai.Usage
		if err := json.Unmarshal([]byte(log.Content), &usage); err != nil {
			continue // 跳过解析失败的记录
		}

		// 累加相同日期的Token数量
		dateMap[dateStr] += usage.TotalTokens
	}

	// 将map转换为切片
	for dateStr, value := range dateMap {
		date = append(date, ld{
			Date:  dateStr,
			Value: value,
		})
	}

	// 返回数据
	ctx.JSON(http.StatusOK, global.MsgBack{
		Code:    global.StatusSuccess,
		Message: "success",
		Data:    date,
	})
}
