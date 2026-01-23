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

	utils.Success(c, "注册成功，请等待审核")
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
	merchant.Name = req.Name
	merchant.Phone = req.Phone
	merchant.Address = req.Address
	merchant.LicenseImage = req.LicenseImage
	// 注意：Status 不能由商家自己更新

	if err := db.DB.Save(&merchant).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, merchant)
}
