package main

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

func main() {
	config.LoadConfig()

	fmt.Println("JWT Secret:", config.GlobalConfig.JWTSecret)
	fmt.Println("JWT Expire:", config.GlobalConfig.JWTExpire)

	// Test 1: 生成 token
	userID := uint(2)
	openID := "test_openid_123"

	token := generateTestToken(userID, openID)
	fmt.Println("\nGenerated token:", token)

	// Test 2: 解析 token
	claims := parseTestToken(token)
	if claims != nil {
		fmt.Println("Parsed token:")
		fmt.Println("  UserID:", claims.UserID)
		fmt.Println("  OpenID:", claims.OpenID)
		fmt.Println("  ExpiresAt:", claims.ExpiresAt)
		fmt.Println("  IssuedAt:", claims.IssuedAt)
		fmt.Println("  Subject:", claims.Subject)
	}
}

func generateTestToken(userID uint, openID string) string {
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
	secret := []byte(config.GlobalConfig.JWTSecret)
	return token.SignedString(secret)
}

func parseTestToken(tokenString string) *Claims {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.GlobalConfig.JWTSecret), nil
	})

	if err != nil {
		fmt.Printf("Parse error: %v\n", err)
		return nil
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims
	}

	return nil
}

func main() {
	config.LoadConfig()

	fmt.Println("JWT Secret:", string(config.GlobalConfig.JWTSecret))
	fmt.Println("JWT Expire:", config.GlobalConfig.JWTExpire)

	// Test 1: 生成 token
	userID := uint(2)
	openID := "test_openid_123"

	token := generateTestToken(userID, openID)
	fmt.Println("\nGenerated token:", token)

	// Test 2: 解析 token
	claims := parseTestToken(token)
	if claims != nil {
		fmt.Println("Parsed token:")
		fmt.Println("  UserID:", claims.UserID)
		fmt.Println("  OpenID:", claims.OpenID)
		fmt.Println("  ExpiresAt:", claims.ExpiresAt)
		fmt.Println("  IssuedAt:", claims.IssuedAt)
		fmt.Println("  Subject:", claims.Subject)
	}
}

func generateTestToken(userID uint, openID string) string {
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
	secret := []byte(config.GlobalConfig.JWTSecret)
	return token.SignedString(secret)
}

func parseTestToken(tokenString string) *Claims {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})

	if err != nil {
		fmt.Printf("Parse error: %v\n", err)
		return nil
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims
	}

	return nil
}
