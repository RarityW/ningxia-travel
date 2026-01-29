package v1

import (
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
	"ningxia-wenlv-backend/utils"

	"github.com/gin-gonic/gin"
)

// SearchResponse 定义搜索返回结构
type SearchResponse struct {
	Attractions []models.Attraction `json:"attractions"`
	Products    []models.Product    `json:"products"`
	Food        []models.Food       `json:"food"`
	Culture     []models.Culture    `json:"culture"`
}

// Search 全局搜索接口
func Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.Success(c, SearchResponse{
			Attractions: []models.Attraction{},
			Products:    []models.Product{},
			Food:        []models.Food{},
			Culture:     []models.Culture{},
		})
		return
	}

	searchPattern := "%" + query + "%"
	var attractions []models.Attraction
	var products []models.Product
	var food []models.Food
	var culture []models.Culture

	// 搜索景点
	db.DB.Where("name LIKE ? OR description LIKE ?", searchPattern, searchPattern).
		Limit(5).Find(&attractions)

	// 搜索商品
	db.DB.Where("name LIKE ? OR description LIKE ?", searchPattern, searchPattern).
		Limit(5).Find(&products)

	// 搜索美食
	db.DB.Where("name LIKE ? OR description LIKE ?", searchPattern, searchPattern).
		Limit(5).Find(&food)

	// 搜索文化
	db.DB.Where("name LIKE ? OR description LIKE ?", searchPattern, searchPattern).
		Limit(5).Find(&culture)

	response := SearchResponse{
		Attractions: attractions,
		Products:    products,
		Food:        food,
		Culture:     culture,
	}

	utils.Success(c, response)
}
