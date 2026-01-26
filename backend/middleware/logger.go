package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestLogger returns a gin.HandlerFunc (middleware) that logs requests using slog,
// excluding raw static assets to reduce noise.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Log only after request is processed
		// Skip logging for static assets unless error (optional optimization)
		// if (path == "/health" || len(path) > 7 && path[:7] == "/static") && c.Writer.Status() < 400 {
		// 	return 
		// }

		end := time.Now()
		latency := end.Sub(start)

		clientIP := c.ClientIP()
		if len(c.Request.Header.Get("X-Forwarded-For")) > 0 {
			clientIP = c.Request.Header.Get("X-Forwarded-For")
		}
		
		method := c.Request.Method
		statusCode := c.Writer.Status()
		errorMessage := c.Errors.ByType(gin.ErrorTypePrivate).String()

		if raw != "" {
			path = path + "?" + raw
		}

		logger := slog.Default()

		// Attributes to log
		attrs := []any{
			slog.String("method", method),
			slog.String("path", path),
			slog.Int("status", statusCode),
			slog.Duration("latency", latency),
			slog.String("ip", clientIP),
		}

		if errorMessage != "" {
			attrs = append(attrs, slog.String("error", errorMessage))
		}

		// Log level based on status
		if statusCode >= 500 {
			logger.Error("request_failed", attrs...)
		} else if statusCode >= 400 {
			logger.Warn("request_client_error", attrs...)
		} else {
			logger.Info("request_success", attrs...)
		}
	}
}
