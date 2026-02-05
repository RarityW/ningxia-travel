package v1

import (
	"net/http"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"

	"github.com/gin-gonic/gin"
)

// Public: Get Assets by Type
func GetAssets(c *gin.Context) {
	assetType := c.Query("type")
	var assets []models.FrontendAsset

	query := db.DB.Where("status = ?", 1).Order("sort_order asc")

	if assetType != "" {
		query = query.Where("type = ?", assetType)
	}

	if err := query.Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "Failed to fetch assets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "success", "list": assets})
}

// Admin: Get All Assets
func AdminGetAssets(c *gin.Context) {
	var assets []models.FrontendAsset
	assetType := c.Query("type")

	query := db.DB.Order("type asc, sort_order asc")
	if assetType != "" {
		query = query.Where("type = ?", assetType)
	}

	if err := query.Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"list": assets})
}

// Admin: Create Asset
func AdminCreateAsset(c *gin.Context) {
	var asset models.FrontendAsset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create asset"})
		return
	}

	c.JSON(http.StatusCreated, asset)
}

// Admin: Update Asset
func AdminUpdateAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.FrontendAsset

	if err := db.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	var input models.FrontendAsset
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.DB.Model(&asset).Updates(input)
	c.JSON(http.StatusOK, asset)
}

// Admin: Delete Asset
func AdminDeleteAsset(c *gin.Context) {
	id := c.Param("id")
	if err := db.DB.Delete(&models.FrontendAsset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete asset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Asset deleted"})
}
