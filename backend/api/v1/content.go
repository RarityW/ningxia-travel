package v1

import (
	"fmt"
	"math/rand"
	"path/filepath"
	"time"

	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
	"ningxia-wenlv-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetAttractions 获取景点列表
func GetAttractions(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	category := c.DefaultQuery("category", "all")
	keyword := c.Query("keyword")

	var attractions []models.Attraction
	var total int64

	query := db.DB.Model(&models.Attraction{}).Where("status = 1")

	// 分类筛选
	if category != "all" {
		if category == "5A" {
			query = query.Where("grade = ?", "5A")
		} else if category == "4A" {
			query = query.Where("grade = ?", "4A")
		} else {
			query = query.Where("category = ?", category)
		}
	}

	// 关键字搜索
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	// 计算总数
	query.Count(&total)

	// 分页查询
	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := query.Offset(offset).Limit(parseInt(pageSize)).Order("recommend DESC, rating DESC, views DESC").Find(&attractions).Error; err != nil {
		utils.ServerError(c, "获取景点列表失败")
		return
	}

	// 增加浏览量
	for _, attraction := range attractions {
		db.DB.Model(&attraction).Update("views", gorm.Expr("views + 1"))
	}

	utils.PageSuccess(c, attractions, parseInt(page), parseInt(pageSize), total)
}

// GetAttraction 获取景点详情
func GetAttraction(c *gin.Context) {
	id := c.Param("id")

	var attraction models.Attraction
	if err := db.DB.First(&attraction, id).Error; err != nil {
		utils.NotFound(c)
		return
	}

	// 增加浏览量
	db.DB.Model(&attraction).Update("views", gorm.Expr("views + 1"))

	utils.Success(c, attraction)
}

// GetFoods 获取美食列表
func GetFoods(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	category := c.DefaultQuery("category", "all")
	keyword := c.Query("keyword")

	var foods []models.Food
	var total int64

	query := db.DB.Model(&models.Food{}).Where("status = 1")

	if category != "all" {
		query = query.Where("category = ?", category)
	}

	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := query.Offset(offset).Limit(parseInt(pageSize)).Order("rating DESC, views DESC").Find(&foods).Error; err != nil {
		utils.ServerError(c, "获取美食列表失败")
		return
	}

	utils.PageSuccess(c, foods, parseInt(page), parseInt(pageSize), total)
}

// GetFood 获取美食详情
func GetFood(c *gin.Context) {
	id := c.Param("id")

	var food models.Food
	if err := db.DB.First(&food, id).Error; err != nil {
		utils.NotFound(c)
		return
	}

	utils.Success(c, food)
}

// GetCultures 获取文化列表
func GetCultures(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	category := c.DefaultQuery("category", "all")
	keyword := c.Query("keyword")

	var cultures []models.Culture
	var total int64

	query := db.DB.Model(&models.Culture{}).Where("status = 1")

	if category != "all" {
		query = query.Where("category = ?", category)
	}

	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := query.Offset(offset).Limit(parseInt(pageSize)).Order("rating DESC, views DESC").Find(&cultures).Error; err != nil {
		utils.ServerError(c, "获取文化列表失败")
		return
	}

	utils.PageSuccess(c, cultures, parseInt(page), parseInt(pageSize), total)
}

// GetCulture 获取文化详情
func GetCulture(c *gin.Context) {
	id := c.Param("id")

	var culture models.Culture
	if err := db.DB.First(&culture, id).Error; err != nil {
		utils.NotFound(c)
		return
	}

	utils.Success(c, culture)
}

// GetProducts 获取商品列表
func GetProducts(c *gin.Context) {
	var total int64

	// 先获取总数
	if err := db.DB.Model(&models.Product{}).Where("status = 1").Count(&total).Error; err != nil {
		utils.ServerError(c, "获取商品列表失败")
		return
	}

	// 使用 GORM 查询
	var products []models.Product
	if err := db.DB.Where("status = 1").Order("sales DESC, created_at DESC").Find(&products).Error; err != nil {
		utils.ServerError(c, "获取商品列表失败")
		return
	}

	utils.PageSuccess(c, products, 1, 10, total)
}

// GetProduct 获取商品详情
func GetProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := db.DB.First(&product, id).Error; err != nil {
		utils.NotFound(c)
		return
	}

	utils.Success(c, product)
}

// ============ 管理员接口 ============

// AdminGetAttractions 管理员获取景点列表
func AdminGetAttractions(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	var attractions []models.Attraction
	var total int64

	db.DB.Model(&models.Attraction{}).Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := db.DB.Offset(offset).Limit(parseInt(pageSize)).Order("created_at DESC").Find(&attractions).Error; err != nil {
		utils.ServerError(c, "获取景点列表失败")
		return
	}

	utils.PageSuccess(c, attractions, parseInt(page), parseInt(pageSize), total)
}

// AdminCreateAttraction 管理员创建景点
func AdminCreateAttraction(c *gin.Context) {
	var attraction models.Attraction
	if err := c.ShouldBindJSON(&attraction); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Create(&attraction).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, attraction)
}

// AdminUpdateAttraction 管理员更新景点
func AdminUpdateAttraction(c *gin.Context) {
	id := c.Param("id")

	var attraction models.Attraction
	if err := c.ShouldBindJSON(&attraction); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Model(&models.Attraction{}).Where("id = ?", id).Updates(&attraction).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// AdminDeleteAttraction 管理员删除景点
func AdminDeleteAttraction(c *gin.Context) {
	id := c.Param("id")

	if err := db.DB.Delete(&models.Attraction{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

// AdminGetFoods 管理员获取美食列表
func AdminGetFoods(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	var foods []models.Food
	var total int64

	db.DB.Model(&models.Food{}).Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := db.DB.Offset(offset).Limit(parseInt(pageSize)).Order("created_at DESC").Find(&foods).Error; err != nil {
		utils.ServerError(c, "获取美食列表失败")
		return
	}

	utils.PageSuccess(c, foods, parseInt(page), parseInt(pageSize), total)
}

// AdminCreateFood 管理员创建美食
func AdminCreateFood(c *gin.Context) {
	var food models.Food
	if err := c.ShouldBindJSON(&food); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Create(&food).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, food)
}

// AdminUpdateFood 管理员更新美食
func AdminUpdateFood(c *gin.Context) {
	id := c.Param("id")

	var food models.Food
	if err := c.ShouldBindJSON(&food); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Model(&models.Food{}).Where("id = ?", id).Updates(&food).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// AdminDeleteFood 管理员删除美食
func AdminDeleteFood(c *gin.Context) {
	id := c.Param("id")

	if err := db.DB.Delete(&models.Food{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

// AdminGetCultures 管理员获取文化列表
func AdminGetCultures(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	var cultures []models.Culture
	var total int64

	db.DB.Model(&models.Culture{}).Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := db.DB.Offset(offset).Limit(parseInt(pageSize)).Order("created_at DESC").Find(&cultures).Error; err != nil {
		utils.ServerError(c, "获取文化列表失败")
		return
	}

	utils.PageSuccess(c, cultures, parseInt(page), parseInt(pageSize), total)
}

// AdminCreateCulture 管理员创建文化
func AdminCreateCulture(c *gin.Context) {
	var culture models.Culture
	if err := c.ShouldBindJSON(&culture); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Create(&culture).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, culture)
}

// AdminUpdateCulture 管理员更新文化
func AdminUpdateCulture(c *gin.Context) {
	id := c.Param("id")

	var culture models.Culture
	if err := c.ShouldBindJSON(&culture); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Model(&models.Culture{}).Where("id = ?", id).Updates(&culture).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// AdminDeleteCulture 管理员删除文化
func AdminDeleteCulture(c *gin.Context) {
	id := c.Param("id")

	if err := db.DB.Delete(&models.Culture{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

// AdminGetProducts 管理员获取商品列表
func AdminGetProducts(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	// 获取当前登录管理员角色
	role, _ := c.Get("admin_role")
	adminID, _ := c.Get("admin_id")

	var products []models.Product
	var total int64

	query := db.DB.Model(&models.Product{})

	// 如果是商家 (Role=3)，只显示自己的商品
	if role.(int) == 3 {
		var merchant models.Merchant
		if err := db.DB.Where("admin_id = ?", adminID).First(&merchant).Error; err != nil {
			utils.Error(c, utils.CodePermissionDenied, "找不到商家信息")
			return
		}
		query = query.Where("merchant_id = ?", merchant.ID)
	}

	query.Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := query.Offset(offset).Limit(parseInt(pageSize)).Order("created_at DESC").Find(&products).Error; err != nil {
		utils.ServerError(c, "获取商品列表失败")
		return
	}

	utils.PageSuccess(c, products, parseInt(page), parseInt(pageSize), total)
}

// AdminCreateProduct 管理员创建商品
func AdminCreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// 获取角色以设置商家ID
	role, _ := c.Get("admin_role")
	adminID, _ := c.Get("admin_id")

	if role.(int) == 3 {
		var merchant models.Merchant
		if err := db.DB.Where("admin_id = ?", adminID).First(&merchant).Error; err != nil {
			utils.Error(c, utils.CodePermissionDenied, "找不到商家信息")
			return
		}
		product.MerchantID = merchant.ID
	} else {
		// 平台管理员创建默认为 0 (自营)
		product.MerchantID = 0
	}

	if err := db.DB.Create(&product).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, product)
}

// AdminUpdateProduct 管理员更新商品
func AdminUpdateProduct(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("admin_role")
	adminID, _ := c.Get("admin_id")

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	query := db.DB.Model(&models.Product{}).Where("id = ?", id)

	// 商家只能更新自己的商品
	if role.(int) == 3 {
		var merchant models.Merchant
		if err := db.DB.Where("admin_id = ?", adminID).First(&merchant).Error; err != nil {
			utils.Error(c, utils.CodePermissionDenied, "找不到商家信息")
			return
		}
		query = query.Where("merchant_id = ?", merchant.ID)
	}

	if err := query.Updates(&product).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// AdminDeleteProduct 管理员删除商品
func AdminDeleteProduct(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("admin_role")
	adminID, _ := c.Get("admin_id")

	query := db.DB.Where("id = ?", id)

	// 商家只能删除自己的商品
	if role.(int) == 3 {
		var merchant models.Merchant
		if err := db.DB.Where("admin_id = ?", adminID).First(&merchant).Error; err != nil {
			utils.Error(c, utils.CodePermissionDenied, "找不到商家信息")
			return
		}
		query = query.Where("merchant_id = ?", merchant.ID)
	}

	if err := query.Delete(&models.Product{}).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

// AdminGetOrders 管理员获取订单列表
func AdminGetOrders(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	status := c.Query("status")

	var orders []models.Order
	var total int64

	query := db.DB.Model(&models.Order{})

	if status != "" {
		query = query.Where("status = ?", parseInt(status))
	}

	query.Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := query.Offset(offset).Limit(parseInt(pageSize)).Order("created_at DESC").Find(&orders).Error; err != nil {
		utils.ServerError(c, "获取订单列表失败")
		return
	}

	utils.PageSuccess(c, orders, parseInt(page), parseInt(pageSize), total)
}

// AdminUpdateOrderStatus 管理员更新订单状态
func AdminUpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")

	type UpdateRequest struct {
		Status int `json:"status" binding:"required"`
	}

	var req UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Model(&models.Order{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// AdminGetCoupons 管理员获取优惠券列表
func AdminGetCoupons(c *gin.Context) {
	var coupons []models.Coupon

	if err := db.DB.Order("created_at DESC").Find(&coupons).Error; err != nil {
		utils.ServerError(c, "获取优惠券列表失败")
		return
	}

	utils.Success(c, coupons)
}

// AdminCreateCoupon 管理员创建优惠券
func AdminCreateCoupon(c *gin.Context) {
	var coupon models.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Create(&coupon).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, coupon)
}

// AdminUpdateCoupon 管理员更新优惠券
func AdminUpdateCoupon(c *gin.Context) {
	id := c.Param("id")

	var coupon models.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Model(&models.Coupon{}).Where("id = ?", id).Updates(&coupon).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

// AdminDeleteCoupon 管理员删除优惠券
func AdminDeleteCoupon(c *gin.Context) {
	id := c.Param("id")

	if err := db.DB.Delete(&models.Coupon{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

// UploadFile 文件上传
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.ParamError(c, "获取文件失败")
		return
	}

	// 验证文件大小
	if file.Size > 10485760 { // 10MB
		utils.ParamError(c, "文件大小不能超过10MB")
		return
	}

	// 生成文件名
	fileName := generateFileName(file.Filename)
	filePath := "./static/uploads/" + fileName

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		utils.ServerError(c, "文件保存失败")
		return
	}

	utils.Success(c, gin.H{
		"url": "/uploads/" + fileName,
	})
}

// parseInt 已移至 parse.go 供包内复用

func generateFileName(original string) string {
	ext := filepath.Ext(original)

	// 简单随机字符串逻辑
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	randomStr := string(b)

	// 使用纳秒级时间戳 + 6位随机字符串
	return fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), randomStr, ext)
}
