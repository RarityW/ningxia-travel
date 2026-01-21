package utils

import (
	"github.com/gin-gonic/gin"
)

// Response 统一响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// PageResponse 分页响应结构
type PageResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Page    int         `json:"page,omitempty"`
	PageSize int        `json:"page_size,omitempty"`
	Total   int64       `json:"total,omitempty"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	// debug: print data being returned
	// fmt.Printf("Response Success data: %#v\n", data)
	c.JSON(200, Response{
		Code:    200,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMessage 成功响应带消息
func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(200, Response{
		Code:    200,
		Message: message,
		Data:    data,
	})
}

// Error 错误响应
func Error(c *gin.Context, code int, message string) {
	c.JSON(200, Response{
		Code:    code,
		Message: message,
	})
}

// PageSuccess 分页成功响应
func PageSuccess(c *gin.Context, data interface{}, page, pageSize int, total int64) {
	c.JSON(200, PageResponse{
		Code:     200,
		Message:  "success",
		Data:     data,
		Page:     page,
		PageSize: pageSize,
		Total:    total,
	})
}

// ParamError 参数错误响应
func ParamError(c *gin.Context, message string) {
	Error(c, 400, message)
}

// Unauthorized 未授权响应
func Unauthorized(c *gin.Context) {
	Error(c, 401, "未授权访问")
}

// NotFound 资源不存在响应
func NotFound(c *gin.Context) {
	Error(c, 404, "资源不存在")
}

// ServerError 服务器错误响应
func ServerError(c *gin.Context, message string) {
	Error(c, 500, message)
}

// 业务错误码
const (
	CodeSuccess           = 200
	CodeParamError        = 400
	CodeUnauthorized      = 401
	CodeNotFound          = 404
	CodeServerError        = 500
	CodeUserNotFound      = 1001
	CodeUserExists        = 1002
	CodeLoginFailed       = 1003
	CodeInvalidToken       = 1004
	CodeProductOutOfStock  = 2001
	CodeOrderNotFound      = 3001
	CodeCartEmpty         = 3002
)
