package service

import (
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
	"server/global"
	"time"
)

type jwtToken struct{}

var JwtToken = new(jwtToken)

// Generate 生成
func (t jwtToken) Generate(issuer string, expiresAt time.Time) (securityToken string, err error) {
	claims := &jwt.RegisteredClaims{
		Issuer:    issuer,
		ExpiresAt: jwt.NewNumericDate(expiresAt),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	securityToken, err = token.SignedString([]byte(global.SysSecurity))
	if err != nil {
		global.APP_LOG.Error("[service] jwt生成失败", zap.Error(err))
		return "", err
	}
	return
}

// Decode 解析
func (t jwtToken) Decode(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			global.APP_LOG.Error("[service] jwt签名方法解析失败", zap.Any("error", token.Header["alg"]))
			return nil, fmt.Errorf("签名方法解析失败: %v", token.Header["alg"])
		}
		return []byte(global.SysSecurity), nil
	})
	if err != nil {
		switch {
		case errors.Is(err, jwt.ErrInvalidKey):
			return nil, fmt.Errorf("密钥无效")
		case errors.Is(err, jwt.ErrInvalidKeyType):
			return nil, fmt.Errorf("密钥类型无效")
		case errors.Is(err, jwt.ErrHashUnavailable):
			return nil, fmt.Errorf("请求的哈希函数不可用")
		case errors.Is(err, jwt.ErrTokenMalformed):
			return nil, fmt.Errorf("token 格式错误")
		case errors.Is(err, jwt.ErrTokenUnverifiable):
			return nil, fmt.Errorf("token 无法验证")
		case errors.Is(err, jwt.ErrTokenSignatureInvalid):
			return nil, fmt.Errorf("token 签名无效")
		case errors.Is(err, jwt.ErrTokenRequiredClaimMissing):
			return nil, fmt.Errorf("token 缺少必要的声明")
		case errors.Is(err, jwt.ErrTokenInvalidAudience):
			return nil, fmt.Errorf("token 受众无效")
		case errors.Is(err, jwt.ErrTokenExpired):
			return nil, fmt.Errorf("token 已过期")
		case errors.Is(err, jwt.ErrTokenUsedBeforeIssued):
			return nil, fmt.Errorf("token 在签发前使用")
		case errors.Is(err, jwt.ErrTokenInvalidIssuer):
			return nil, fmt.Errorf("token 发行人无效")
		case errors.Is(err, jwt.ErrTokenInvalidSubject):
			return nil, fmt.Errorf("token 主题无效")
		case errors.Is(err, jwt.ErrTokenNotValidYet):
			return nil, fmt.Errorf("token 尚未生效")
		case errors.Is(err, jwt.ErrTokenInvalidId):
			return nil, fmt.Errorf("token ID 无效")
		case errors.Is(err, jwt.ErrTokenInvalidClaims):
			return nil, fmt.Errorf("token 声明无效")
		case errors.Is(err, jwt.ErrInvalidType):
			return nil, fmt.Errorf("声明类型无效")
		default:
			return nil, err
		}
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims, nil
	} else {
		return nil, errors.New("token 解析失败")
	}
}
