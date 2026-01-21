package v1

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
	"ningxia-wenlv-backend/utils"
)

// Login 小程序登录
func Login(c *gin.Context) {
	type LoginRequest struct {
		OpenID   string `json:"openid" binding:"required"`
		NickName string `json:"nickname"`
		Avatar   string `json:"avatar"`
		Gender   int    `json:"gender"`
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// 查找或创建用户 - 使用原生SQL更可靠
	var user models.User

	// 先查询用户
	if err := db.DB.Where("open_id = ?", req.OpenID).First(&user).Error; err != nil {
		// 用户不存在，创建新用户
		user = models.User{
			OpenID:   req.OpenID,
			NickName: req.NickName,
			Avatar:   req.Avatar,
			Gender:   req.Gender,
			IsActive: true,
		}

		// 使用原始SQL插入
		sql := `INSERT INTO users (open_id, nick_name, avatar, gender, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`
		if err := db.DB.Exec(sql, user.OpenID, user.NickName, user.Avatar, user.Gender, user.IsActive).Error; err != nil {
			fmt.Printf("创建用户失败: %v, open_id=%s\n", err, req.OpenID)
			utils.ServerError(c, "注册失败")
			return
		}

		// 重新加载用户
		if err := db.DB.Where("open_id = ?", req.OpenID).First(&user).Error; err != nil {
			fmt.Printf("重新加载用户失败: %v, open_id=%s\n", err, req.OpenID)
			utils.ServerError(c, "注册失败")
			return
		}
		fmt.Printf("新用户注册成功: id=%d, open_id=%s\n", user.ID, user.OpenID)
	} else {
		fmt.Printf("用户已存在: id=%d, open_id=%s\n", user.ID, user.OpenID)
	}

	// 生成 JWT token
	token, err := utils.GenerateToken(user.ID, user.OpenID)
	if err != nil {
		utils.ServerError(c, "生成令牌失败")
		return
	}

	utils.Success(c, gin.H{
		"token":    token,
		"user_id":  user.ID,
		"openid":   user.OpenID,
		"nickname": user.NickName,
		"avatar":   user.Avatar,
	})
}

// AdminLogin 管理员登录
func AdminLogin(c *gin.Context) {
	type LoginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// 查找管理员
	var admin models.Admin
	if err := db.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		utils.Error(c, utils.CodeLoginFailed, "用户名或密码错误")
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
		utils.Error(c, utils.CodeLoginFailed, "用户名或密码错误")
		return
	}

	// 检查账号状态
	if admin.Status != 1 {
		utils.Error(c, utils.CodeLoginFailed, "账号已被禁用")
		return
	}

	// 生成管理员 access + refresh token，并设置为 HttpOnly cookie
	accessToken, refreshToken, err := utils.GenerateAdminTokens(admin.ID, admin.Username)
	if err != nil {
		utils.ServerError(c, "生成令牌失败")
		return
	}

	// for debugging in server logs
	fmt.Println("generated admin access token:", accessToken)

	// 设置 cookie（开发环境下 Secure=false；生产请启用 Secure=true 并使用 HTTPS）
	accessCookie := &http.Cookie{
		Name:     "admin_access_token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   3600,
	}
	refreshCookie := &http.Cookie{
		Name:     "admin_refresh_token",
		Value:    refreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   7 * 24 * 3600,
	}
	http.SetCookie(c.Writer, accessCookie)
	http.SetCookie(c.Writer, refreshCookie)

	utils.Success(c, gin.H{
		"admin_id": admin.ID,
		"username": admin.Username,
		"name":     admin.Name,
		"role":     admin.Role,
	})
}

// GetUserProfile 获取用户信息
func GetUserProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c)
		return
	}

	utils.Success(c, user)
}

// UpdateProfile 更新用户信息
func UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	type UpdateRequest struct {
		NickName string `json:"nickname"`
		Phone    string `json:"phone"`
	}

	var req UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	updates := make(map[string]interface{})
	if req.NickName != "" {
		updates["nick_name"] = req.NickName
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}

	if err := db.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// AddFavorite 添加收藏
func AddFavorite(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	type FavoriteRequest struct {
		Type     string `json:"type" binding:"required"` // attraction/food/culture
		TargetID uint   `json:"target_id" binding:"required"`
	}

	var req FavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// TODO: 实现收藏功能（需要收藏表）
	utils.Success(c, nil)
}

// DeleteFavorite 删除收藏
func DeleteFavorite(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}
	_ = c.Param("id")

	// TODO: 删除收藏（使用 id）
	utils.Success(c, nil)
}

// GetFavorites 获取收藏列表
func GetFavorites(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	// TODO: 获取收藏列表
	utils.Success(c, []interface{}{})
}

// GetCart 获取购物车
func GetCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	var carts []models.Cart
	if err := db.DB.Where("user_id = ?", userID).Find(&carts).Error; err != nil {
		utils.ServerError(c, "获取购物车失败")
		return
	}

	utils.Success(c, carts)
}

// AddToCart 添加到购物车
func AddToCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	type CartRequest struct {
		ProductID uint `json:"product_id" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required"`
	}

	var req CartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// 检查商品是否存在
	var product models.Product
	if err := db.DB.First(&product, req.ProductID).Error; err != nil {
		utils.NotFound(c)
		return
	}

	// 检查库存
	if product.Stock < req.Quantity {
		utils.Error(c, utils.CodeProductOutOfStock, "库存不足")
		return
	}

	// 查找是否已在购物车
	var cart models.Cart
	if err := db.DB.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&cart).Error; err != nil {
		// 不存在，创建新记录
		cart = models.Cart{
			UserID:    userID.(uint),
			ProductID: req.ProductID,
			Quantity:  req.Quantity,
		}
		if err := db.DB.Create(&cart).Error; err != nil {
			utils.ServerError(c, "添加失败")
			return
		}
	} else {
		// 存在，更新数量
		if err := db.DB.Model(&cart).Update("quantity", cart.Quantity+req.Quantity).Error; err != nil {
			utils.ServerError(c, "更新失败")
			return
		}
	}

	utils.Success(c, nil)
}

// UpdateCart 更新购物车
func UpdateCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	id := c.Param("id")

	type UpdateCartRequest struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	var req UpdateCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Model(&models.Cart{}).Where("id = ? AND user_id = ?", id, userID).Update("quantity", req.Quantity).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// DeleteFromCart 从购物车删除
func DeleteFromCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	id := c.Param("id")

	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Cart{}).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

// GetOrders 获取订单列表
func GetOrders(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	var orders []models.Order
	var total int64

	db.DB.Model(&models.Order{}).Where("user_id = ?", userID).Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := db.DB.Where("user_id = ?", userID).Offset(offset).Limit(parseInt(pageSize)).Find(&orders).Error; err != nil {
		utils.ServerError(c, "获取订单列表失败")
		return
	}

	utils.PageSuccess(c, orders, parseInt(page), parseInt(pageSize), total)
}

// CreateOrder 创建订单
func CreateOrder(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	type OrderRequest struct {
		Address string `json:"address" binding:"required"`
		Remark  string `json:"remark"`
	}

	var req OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// 获取购物车商品
	var carts []models.Cart
	if err := db.DB.Where("user_id = ?", userID).Find(&carts).Error; err != nil {
		utils.ServerError(c, "获取购物车失败")
		return
	}

	if len(carts) == 0 {
		utils.Error(c, utils.CodeCartEmpty, "购物车为空")
		return
	}

	// 计算总价
	var totalPrice float64
	for _, cart := range carts {
		var product models.Product
		if err := db.DB.First(&product, cart.ProductID).Error; err != nil {
			continue
		}
		totalPrice += product.Price * float64(cart.Quantity)
	}

	// 生成订单号
	orderNo := generateOrderNo()

	// 创建订单
	order := models.Order{
		OrderNo:    orderNo,
		UserID:     userID.(uint),
		TotalPrice: totalPrice,
		Status:     0, // 待支付
		Address:    req.Address,
		Remark:     req.Remark,
	}

	if err := db.DB.Create(&order).Error; err != nil {
		utils.ServerError(c, "创建订单失败")
		return
	}

	// 创建订单明细
	for _, cart := range carts {
		var product models.Product
		db.DB.First(&product, cart.ProductID)

		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: cart.ProductID,
			Quantity:  cart.Quantity,
			Price:     product.Price,
		}
		db.DB.Create(&orderItem)
	}

	// 清空购物车
	db.DB.Where("user_id = ?", userID).Delete(&models.Cart{})

	utils.Success(c, gin.H{
		"order_no": orderNo,
		"order_id": order.ID,
	})
}

// GetOrder 获取订单详情
func GetOrder(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	id := c.Param("id")

	var order models.Order
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.Error(c, utils.CodeOrderNotFound, "订单不存在")
		return
	}

	utils.Success(c, order)
}

// GetCoupons 获取优惠券列表
func GetCoupons(c *gin.Context) {
	var coupons []models.Coupon
	now := time.Now()

	if err := db.DB.Where("status = 1 AND start_time <= ? AND end_time >= ?", now, now).Find(&coupons).Error; err != nil {
		utils.ServerError(c, "获取优惠券失败")
		return
	}

	utils.Success(c, coupons)
}

// 辅助函数
func generateOrderNo() string {
	return fmt.Sprintf("%d%d", time.Now().Unix(), time.Now().UnixNano()%1000)
}
