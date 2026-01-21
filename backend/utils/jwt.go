package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"ningxia-wenlv-backend/config"
)

type Claims struct {
	UserID    uint   `json:"user_id"`
	OpenID    string `json:"openid"`
	ExpiresAt int64  `json:"exp"`
	IssuedAt  int64  `json:"iat"`
	jwt.RegisteredClaims
}

func getJWTSecret() []byte {
	if config.GlobalConfig != nil && config.GlobalConfig.JWTSecret != "" {
		return []byte(config.GlobalConfig.JWTSecret)
	}
	return []byte("default-secret-change-this")
}

// GenerateToken 生成 JWT token
func GenerateToken(userID uint, openID string) (string, error) {
	nowTime := time.Now()
	expireTime := nowTime.Add(time.Duration(config.GlobalConfig.JWTExpire) * time.Hour)

	claims := Claims{
		UserID:    userID,
		OpenID:    openID,
		ExpiresAt: expireTime.Unix(),
		IssuedAt:  nowTime.Unix(),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: "user",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

// GenerateAdminToken 生成管理员 JWT token，subject 设置为 "admin"
func GenerateAdminToken(adminID uint, username string) (string, error) {
	nowTime := time.Now()
	expireTime := nowTime.Add(time.Duration(config.GlobalConfig.JWTExpire) * time.Hour)

	claims := Claims{
		UserID:    adminID,
		OpenID:    username,
		ExpiresAt: expireTime.Unix(),
		IssuedAt:  nowTime.Unix(),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: "admin",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

// GenerateAdminTokens 生成管理员的 access 与 refresh token
func GenerateAdminTokens(adminID uint, username string) (string, string, error) {
	nowTime := time.Now()
	accessExpire := nowTime.Add(time.Duration(config.GlobalConfig.JWTExpire) * time.Hour)
	refreshExpire := nowTime.Add(7 * 24 * time.Hour) // 7 days for refresh token

	accessClaims := Claims{
		UserID:    adminID,
		OpenID:    username,
		ExpiresAt: accessExpire.Unix(),
		IssuedAt:  nowTime.Unix(),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: "admin",
		},
	}

	refreshClaims := Claims{
		UserID:    adminID,
		OpenID:    username,
		ExpiresAt: refreshExpire.Unix(),
		IssuedAt:  nowTime.Unix(),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: "admin",
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	a, err := accessToken.SignedString(getJWTSecret())
	if err != nil {
		return "", "", err
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	r, err := refreshToken.SignedString(getJWTSecret())
	if err != nil {
		return "", "", err
	}

	return a, r, nil
}

// ParseToken 解析 JWT token
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return getJWTSecret(), nil
	})

	if err != nil {
		fmt.Printf("Token parsing error: %v\n", err)
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		fmt.Printf("Token valid: user_id=%d, openid=%s, exp=%d, iat=%d\n",
			claims.UserID, claims.OpenID, claims.ExpiresAt, claims.IssuedAt)
		return claims, nil
	}

	fmt.Printf("Token validation failed\n")
	return nil, fmt.Errorf("invalid token")
}

// RefreshToken 刷新 token
func RefreshToken(oldToken string) (string, error) {
	claims, err := ParseToken(oldToken)
	if err != nil {
		return "", err
	}

	// 检查 token 是否快过期
	expiryTime := time.Unix(claims.ExpiresAt, 0)
	if time.Until(expiryTime) > 30*time.Minute {
		return "", fmt.Errorf("token is still valid")
	}

	return GenerateToken(claims.UserID, claims.OpenID)
}
