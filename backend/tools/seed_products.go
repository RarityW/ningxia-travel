package main

import (
	"fmt"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "root"
	}
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "3306"
	}
	name := os.Getenv("DB_NAME")
	if name == "" {
		name = "ningxia_wenlv"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, pass, host, port, name)
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}
	db.DB = database

	fmt.Println("=== 开始添加宁选好礼商品示例数据 ===")
	seedProducts()

	fmt.Println("\n=== 商品数据填充完成 ===")
}

func seedProducts() {
	// 使用占位图服务，避免图片404错误
	placeholderBase := "https://via.placeholder.com/400x300/DAA520/FFFFFF?text="

	products := []models.Product{
		// 宁夏枸杞 类目
		{
			Name:          "中宁枸杞特级 500g",
			CoverImage:    placeholderBase + "Goji+Berry",
			Category:      "宁夏枸杞",
			Price:         68.00,
			OriginalPrice: 98.00,
			Description:   "中宁枸杞，道地药材，颗粒饱满，色泽红润。",
			Sales:         256,
			Stock:         500,
			Status:        1,
		},
		{
			Name:          "有机枸杞原浆 30ml*10袋",
			CoverImage:    placeholderBase + "Goji+Juice",
			Category:      "宁夏枸杞",
			Price:         128.00,
			OriginalPrice: 168.00,
			Description:   "鲜枸杞原浆，无添加，开袋即饮。",
			Sales:         189,
			Stock:         300,
			Status:        1,
		},
		// 贺兰红酒 类目
		{
			Name:          "贺兰山赤霞珠干红 750ml",
			CoverImage:    placeholderBase + "Red+Wine",
			Category:      "贺兰红酒",
			Price:         188.00,
			OriginalPrice: 258.00,
			Description:   "贺兰山东麓产区，法式工艺酿造。",
			Sales:         120,
			Stock:         200,
			Status:        1,
		},
		{
			Name:          "宁夏珍藏级红酒礼盒",
			CoverImage:    placeholderBase + "Wine+Gift",
			Category:      "贺兰红酒",
			Price:         388.00,
			OriginalPrice: 488.00,
			Description:   "精选年份葡萄酒，高端商务礼盒。",
			Sales:         56,
			Stock:         100,
			Status:        1,
		},
		// 盐池滩羊 类目
		{
			Name:          "盐池滩羊肉 精选羊腿肉 2kg",
			CoverImage:    placeholderBase + "Lamb+Meat",
			Category:      "盐池滩羊",
			Price:         298.00,
			OriginalPrice: 398.00,
			Description:   "盐池滩羊，肉质鲜嫩，无膻味。",
			Sales:         178,
			Stock:         150,
			Status:        1,
		},
		{
			Name:          "清真羊肉卷 500g*2盒",
			CoverImage:    placeholderBase + "Lamb+Roll",
			Category:      "盐池滩羊",
			Price:         158.00,
			OriginalPrice: 198.00,
			Description:   "火锅涮肉必备，薄切均匀。",
			Sales:         234,
			Stock:         200,
			Status:        1,
		},
		// 八宝茶 类目
		{
			Name:          "宁夏八宝茶 20袋装",
			CoverImage:    placeholderBase + "Eight+Treasure+Tea",
			Category:      "八宝茶",
			Price:         48.00,
			OriginalPrice: 68.00,
			Description:   "枸杞、红枣、桂圆等八味精选。",
			Sales:         312,
			Stock:         400,
			Status:        1,
		},
		{
			Name:          "盖碗八宝茶礼盒",
			CoverImage:    placeholderBase + "Tea+Gift+Set",
			Category:      "八宝茶",
			Price:         128.00,
			OriginalPrice: 168.00,
			Description:   "含精美盖碗，送礼佳选。",
			Sales:         89,
			Stock:         150,
			Status:        1,
		},
		// 非遗文创 类目
		{
			Name:          "西夏文字冰箱贴套装",
			CoverImage:    placeholderBase + "Fridge+Magnet",
			Category:      "非遗文创",
			Price:         38.00,
			OriginalPrice: 58.00,
			Description:   "西夏文字元素，文创纪念品。",
			Sales:         145,
			Stock:         300,
			Status:        1,
		},
		{
			Name:          "贺兰山岩画丝巾",
			CoverImage:    placeholderBase + "Silk+Scarf",
			Category:      "非遗文创",
			Price:         168.00,
			OriginalPrice: 228.00,
			Description:   "岩画艺术与丝绸工艺完美结合。",
			Sales:         67,
			Stock:         100,
			Status:        1,
		},
		// 特色美食 类目
		{
			Name:          "油香礼盒装 10个",
			CoverImage:    placeholderBase + "Youxiang",
			Category:      "特色美食",
			Price:         58.00,
			OriginalPrice: 78.00,
			Description:   "回族传统美食，酥脆可口。",
			Sales:         198,
			Stock:         200,
			Status:        1,
		},
		{
			Name:          "手工羊油馓子 500g",
			CoverImage:    placeholderBase + "Sanzi",
			Category:      "特色美食",
			Price:         45.00,
			OriginalPrice: 58.00,
			Description:   "传统工艺，香脆酥麻。",
			Sales:         276,
			Stock:         250,
			Status:        1,
		},
	}

	for _, product := range products {
		if err := db.DB.Create(&product).Error; err != nil {
			fmt.Printf("添加商品失败 [%s]: %v\n", product.Name, err)
		} else {
			fmt.Printf("✓ 已添加商品: %s (分类: %s)\n", product.Name, product.Category)
		}
	}
}
