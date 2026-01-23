package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
	"ningxia-wenlv-backend/utils"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		var tokenString string
		if authHeader == "" {
			// 尝试从 cookie 中获取（如前端使用 HttpOnly cookie 存储）
			if cookie, err := c.Cookie("admin_access_token"); err == nil {
				tokenString = cookie
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{
					"code":    401,
					"message": "未提供认证信息",
				})
				c.Abort()
				return
			}
		}
		if tokenString == "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if !(len(parts) == 2 && parts[0] == "Bearer") {
				c.JSON(http.StatusUnauthorized, gin.H{
					"code":    401,
					"message": "认证格式错误",
				})
				c.Abort()
				return
			}
			tokenString = parts[1]
		}

		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "无效的令牌",
			})
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("openid", claims.OpenID)

		fmt.Printf("User authenticated: user_id=%d, openid=%s\n", claims.UserID, claims.OpenID)
		c.Next()
	}
}

// AdminAuthMiddleware 管理员认证中间件
func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		var tokenString string
		if authHeader == "" {
			// 优先从 Authorization header 获取，否则尝试 cookie
			if cookie, err := c.Cookie("admin_access_token"); err == nil {
				tokenString = cookie
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{
					"code":    401,
					"message": "未提供认证信息",
				})
				c.Abort()
				return
			}
		}
		if tokenString == "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if !(len(parts) == 2 && parts[0] == "Bearer") {
				c.JSON(http.StatusUnauthorized, gin.H{
					"code":    401,
					"message": "认证格式错误",
				})
				c.Abort()
				return
			}
			tokenString = parts[1]
		}

		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "无效的令牌",
			})
			c.Abort()
			return
		}

		if claims.RegisteredClaims.Subject != "admin" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "管理员令牌不正确",
			})
			c.Abort()
			return
		}

		// 校验管理员是否存在且状态有效
		var admin models.Admin
		if err := db.DB.First(&admin, claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "管理员不存在",
			})
			c.Abort()
			return
		}
		if admin.Status != 1 {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "管理员已被禁用",
			})
			c.Abort()
			return
		}

		c.Set("admin_id", admin.ID)
		c.Set("admin_username", admin.Username)
		c.Set("admin_role", admin.Role)
		c.Next()
	}
}

// CORSMiddleware 跨域中间件
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		origin := c.Request.Header.Get("Origin")

		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
