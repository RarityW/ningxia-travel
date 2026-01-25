package v1

import (
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
	"ningxia-wenlv-backend/utils"

	"github.com/gin-gonic/gin"
)

// AdminGetStats 获取统计数据
func AdminGetStats(c *gin.Context) {
	var stats struct {
		Attractions int64 `json:"attractions"`
		Food        int64 `json:"food"`
		Culture     int64 `json:"culture"`
		Products    int64 `json:"products"`
		Orders      int64 `json:"orders"`
		Users       int64 `json:"users"`
	}

	// 并发或顺序查询所有表的数量
	// 为简单起见，这里按顺序执行，生产环境可用 goroutine 优化
	if err := db.DB.Model(&models.Attraction{}).Count(&stats.Attractions).Error; err != nil {
		utils.ServerError(c, "统计景点失败")
		return
	}
	if err := db.DB.Model(&models.Food{}).Count(&stats.Food).Error; err != nil {
		utils.ServerError(c, "统计美食失败")
		return
	}
	if err := db.DB.Model(&models.Culture{}).Count(&stats.Culture).Error; err != nil {
		utils.ServerError(c, "统计文化失败")
		return
	}
	if err := db.DB.Model(&models.Product{}).Count(&stats.Products).Error; err != nil {
		utils.ServerError(c, "统计商品失败")
		return
	}
	if err := db.DB.Model(&models.Order{}).Count(&stats.Orders).Error; err != nil {
		utils.ServerError(c, "统计订单失败")
		return
	}
	if err := db.DB.Model(&models.User{}).Count(&stats.Users).Error; err != nil {
		utils.ServerError(c, "统计用户失败")
		return
	}

	utils.Success(c, stats)
}
