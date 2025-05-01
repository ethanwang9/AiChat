package middleware

import (
	"bytes"
	"go.uber.org/zap"
	"io"
	"server/global"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// LogLayout 日志layout
type LogLayout struct {
	Time       time.Time
	Method     string        // 请求类型
	Path       string        // 访问路径
	Query      string        // 携带query
	Body       string        // 携带body数据
	IP         string        // ip地址
	UserAgent  string        // 请求头
	Error      string        // 错误
	Cost       time.Duration // 花费时间
	StatusCode string        // 返回请求代码
}

type Logger struct {
	// Filter 用户自定义过滤
	Filter func(c *gin.Context) bool
	// FilterKeyword 关键字过滤(key)
	FilterKeyword func(layout *LogLayout) bool
	// 日志处理
	Print func(LogLayout)
}

func (l Logger) SetLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		var body []byte
		if l.Filter != nil && !l.Filter(c) {
			body, _ = c.GetRawData()
			// 将原body塞回去
			c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
		}
		c.Next()
		cost := time.Since(start)
		layout := LogLayout{
			Method:     method,
			Time:       time.Now(),
			Path:       path,
			Query:      query,
			IP:         c.ClientIP(),
			UserAgent:  c.Request.UserAgent(),
			Error:      strings.TrimRight(c.Errors.ByType(gin.ErrorTypePrivate).String(), "\n"),
			Cost:       cost,
			StatusCode: strconv.Itoa(c.Writer.Status()),
		}

		if l.Filter != nil && !l.Filter(c) {
			layout.Body = string(body)
		}
		if l.FilterKeyword != nil {
			// 自行判断key/value 脱敏等
			l.FilterKeyword(&layout)
		}
		// 自行处理日志
		l.Print(layout)
	}
}

func DefaultLogger() gin.HandlerFunc {
	return Logger{
		Filter: func(c *gin.Context) bool {
			return false
		},
		Print: func(layout LogLayout) {
			// 写入日志
			global.APP_LOG.Info("[路由] 请求日志", zap.Any("data", layout))
		},
	}.SetLoggerMiddleware()
}
