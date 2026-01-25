package v1

import (
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
	"ningxia-wenlv-backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// RegisterMerchant 商家注册
func RegisterMerchant(c *gin.Context) {
	type RegisterRequest struct {
		Username     string `json:"username" binding:"required"`
		Password     string `json:"password" binding:"required"`
		ShopName     string `json:"shop_name" binding:"required"`
		LicenseImage string `json:"license_image"`
		Phone        string `json:"phone" binding:"required"`
		Address      string `json:"address"`
	}

	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// 1. 检查用户名是否存在
	var count int64
	db.DB.Model(&models.Admin{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		utils.Error(c, utils.CodeParamError, "用户名已存在")
		return
	}

	// 2. 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ServerError(c, "密码加密失败")
		return
	}

	// 3. 开启事务创建 Admin 和 Merchant
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		// 创建管理员账号 (Role: 3 = 商家)
		admin := models.Admin{
			Username: req.Username,
			Password: string(hashedPassword),
			Role:     3, // 3代表商家
			Status:   1, // 默认启用，但商家状态可能为待审核
			Name:     req.ShopName,
		}
		if err := tx.Create(&admin).Error; err != nil {
			return err
		}

		// 创建商家档案
		merchant := models.Merchant{
			AdminID:      admin.ID,
			Name:         req.ShopName,
			LicenseImage: req.LicenseImage,
			Phone:        req.Phone,
			Address:      req.Address,
			Status:       0, // 0: 待审核
		}
		if err := tx.Create(&merchant).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		utils.ServerError(c, "注册失败: "+err.Error())
		return
	}

	utils.Success(c, "注册成功,请等待审核")
}

// GetMerchantProfile 获取商家信息 (需登录)
func GetMerchantProfile(c *gin.Context) {
	// 从中间件获取 adminID
	adminID, exists := c.Get("adminID")
	if !exists {
		utils.Unauthorized(c)
		return
	}

	var merchant models.Merchant
	if err := db.DB.Where("admin_id = ?", adminID).First(&merchant).Error; err != nil {
		utils.NotFound(c)
		return
	}

	utils.Success(c, merchant)
}

// UpdateMerchantProfile 更新商家信息
func UpdateMerchantProfile(c *gin.Context) {
	adminID, _ := c.Get("adminID")

	var req models.Merchant
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	var merchant models.Merchant
	if err := db.DB.Where("admin_id = ?", adminID).First(&merchant).Error; err != nil {
		utils.NotFound(c)
		return
	}

	// 更新字段
	updates := map[string]interface{}{
		"name":          req.Name,
		"logo":          req.Logo,
		"cover_image":   req.CoverImage,
		"description":   req.Description,
		"phone":         req.Phone,
		"address":       req.Address,
		"license_image": req.LicenseImage,
	}

	if err := db.DB.Model(&merchant).Updates(updates).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, merchant)
}

// ===== 管理员接口 =====

// AdminGetMerchants 获取所有商家列表 (管理员)
func AdminGetMerchants(c *gin.Context) {
	var merchants []models.Merchant
	if err := db.DB.Order("created_at DESC").Find(&merchants).Error; err != nil {
		utils.ServerError(c, "获取商家列表失败")
		return
	}
	utils.Success(c, merchants)
}

// AdminCreateMerchant 管理员创建店铺
func AdminCreateMerchant(c *gin.Context) {
	var merchant models.Merchant
	if err := c.ShouldBindJSON(&merchant); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	// 默认状态为正常
	if merchant.Status == 0 {
		merchant.Status = 1
	}

	if err := db.DB.Create(&merchant).Error; err != nil {
		utils.ServerError(c, "创建店铺失败")
		return
	}

	utils.Success(c, merchant)
}

// AdminUpdateMerchant 管理员更新店铺
func AdminUpdateMerchant(c *gin.Context) {
	id := c.Param("id")

	var merchant models.Merchant
	if err := c.ShouldBindJSON(&merchant); err != nil {
		utils.ParamError(c, "参数错误")
		return
	}

	if err := db.DB.Model(&models.Merchant{}).Where("id = ?", id).Updates(&merchant).Error; err != nil {
		utils.ServerError(c, "更新店铺失败")
		return
	}

	utils.Success(c, nil)
}

// AdminDeleteMerchant 管理员删除店铺
func AdminDeleteMerchant(c *gin.Context) {
	id := c.Param("id")

	// 软删除（如果需要）
	if err := db.DB.Delete(&models.Merchant{}, id).Error; err != nil {
		utils.ServerError(c, "删除店铺失败")
		return
	}

	utils.Success(c, nil)
}

// ===== 小程序接口 =====

// GetMerchantDetail 获取店铺详情 (小程序端)
func GetMerchantDetail(c *gin.Context) {
	id := c.Param("id")

	var merchant models.Merchant
	if err := db.DB.Where("id = ? AND status = 1", id).First(&merchant).Error; err != nil {
		utils.NotFound(c)
		return
	}

	utils.Success(c, merchant)
}

// GetMerchantProducts 获取店铺商品列表 (小程序端)
func GetMerchantProducts(c *gin.Context) {
	id := c.Param("id")
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	var products []models.Product
	var total int64

	query := db.DB.Model(&models.Product{}).Where("merchant_id = ? AND status = 1", id)
	query.Count(&total)

	offset := (parseInt(page) - 1) * parseInt(pageSize)
	if err := query.Offset(offset).Limit(parseInt(pageSize)).Order("created_at DESC").Find(&products).Error; err != nil {
		utils.ServerError(c, "获取商品列表失败")
		return
	}

	utils.PageSuccess(c, products, parseInt(page), parseInt(pageSize), total)
}
