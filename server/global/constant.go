package global

// 系统相关

const (
	// SysPort 端口号
	SysPort = 8888
	// SysMode 软件模式
	// debug | release
	SysMode = "debug"
	// SysSecurity 安全密钥
	SysSecurity = "D01E97139E60494C98AE48548B67C33C"
	// SysDomain 系统域名
	SysDomain = "http://127.0.0.1:8888"
)

// 状态码

const (
	// StatusSuccess 成功
	StatusSuccess = 0
	// StatusErrorSys 系统错误
	StatusErrorSys = 100
	// StatusErrorSQL 数据库错误
	StatusErrorSQL = 200
	// StatusErrorBusiness 业务错误
	StatusErrorBusiness = 300
	// StatusErrorBusinessToken token验证失败
	StatusErrorBusinessToken = 301
)

// 数据库

const (
	DBHost      = "127.0.0.1"
	DBPort      = 3306
	DBUser      = "root"
	DBPassword  = "root"
	DBName      = "ai"
	DBPrefix    = "ai_"
	RDBAddress  = "127.0.0.1:6379"
	RDBPassword = "root"
	RDBDB       = 0
)

// 日志

const (
	// LogPath 日志目录
	LogPath = "./log"
	// LogInConsole 日志是否显示在控制台
	LogInConsole = true
	// LogPrefix 日志前缀
	LogPrefix = ""
	// LogFormat 日志显示方式
	// json | console
	LogFormat = "json"
	// LogStacktraceKey 日志栈名
	LogStacktraceKey = "stacktrace"
	// LogEncodeLevel 编码级
	// LowercaseLevelEncoder 小写编码器(默认) | LowercaseColorLevelEncoder 小写编码器带颜色
	// CapitalLevelEncoder 大写编码器 | CapitalColorLevelEncoder 大写编码器带颜色
	LogEncodeLevel = "CapitalLevelEncoder"
	// LogLevel 日志级别
	// debug | info | warn | error | dpanic | panic | fatal
	LogLevel = "debug"
)

// 日志类型

const (
	// LogLevelSystem 系统日志
	LogLevelSystem = "system"
	// LogLevelUser 用户日志
	LogLevelUser = "user"
)

// 文件夹目录

const (
	AssetsPath = "./assets"
)
