package main

import (
	"fmt"
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
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	fmt.Println("Clearing Attractions and Foods...")
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	db.Exec("TRUNCATE TABLE attractions")
	db.Exec("TRUNCATE TABLE foods")
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")

	// Seed Attractions
	fmt.Println("Seeding Attractions...")
	attractions := []models.Attraction{
		{
			Name:        "沙坡头旅游区",
			EnglishName: "Shapotou Tourism Area",
			Grade:       "5A",
			Category:    "自然",
			Region:      "中卫市",
			Address:     "中卫市沙坡头区",
			CoverImage:  "https://images.unsplash.com/photo-1547990196-8d697926715f?w=800", // Desert placeholder
			Description: "集大漠、黄河、高山、绿洲为一体，既有西北风光之雄奇，又兼江南景色之秀美。",
			TicketPrice: 80,
			OpenTime:    "08:00-18:00",
			Rating:      4.8,
			Views:       1200,
			Status:      1,
		},
		{
			Name:        "镇北堡西部影城",
			EnglishName: "Zhenbeibu Western Film Studio",
			Grade:       "5A",
			Category:    "文化",
			Region:      "银川市",
			Address:     "银川市西夏区",
			CoverImage:  "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800", // Ancient wall placeholder
			Description: "中国电影从这里走向世界，被誉为'东方好莱坞'。",
			TicketPrice: 100,
			OpenTime:    "08:00-17:30",
			Rating:      4.9,
			Views:       1500,
			Status:      1,
		},
		{
			Name:        "贺兰山国家森林公园",
			EnglishName: "Helan Mountain National Forest Park",
			Grade:       "4A",
			Category:    "自然",
			Region:      "银川市",
			Address:     "银川市贺兰山",
			CoverImage:  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", // Mountain
			Description: "巍巍贺兰山，千古英雄话。",
			TicketPrice: 60,
			OpenTime:    "08:30-17:00",
			Rating:      4.7,
			Views:       800,
			Status:      1,
		},
		{
			Name:        "水洞沟遗址",
			EnglishName: "Shuidonggou Site",
			Grade:       "5A",
			Category:    "历史",
			Region:      "灵武市",
			Address:     "灵武市临河镇",
			CoverImage:  "https://images.unsplash.com/photo-1599573837889-9430c007119f?w=800", // Canyon
			Description: "中国最早发掘的旧石器时代文化遗址，被誉为'中国史前考古的发祥地'。",
			TicketPrice: 120,
			OpenTime:    "08:00-18:00",
			Rating:      4.6,
			Views:       900,
			Status:      1,
		},
	}
	db.CreateInBatches(attractions, 10)

	// Seed Foods
	fmt.Println("Seeding Foods...")
	foods := []models.Food{
		{
			Name:        "手抓羊肉",
			Category:    "特色菜",
			Region:      "全区",
			CoverImage:  "https://images.unsplash.com/photo-1603535978189-da58c1df723c?w=800", // Meat dish
			Description: "宁夏滩羊肉质细嫩，无膻味，手抓羊肉是宁夏最著名的传统美食。",
			Price:       88,
			Rating:      5.0,
			Views:       2000,
			Status:      1,
		},
		{
			Name:        "羊杂碎",
			Category:    "小吃",
			Region:      "银川市",
			CoverImage:  "https://images.unsplash.com/photo-1549488344-c7052f448b1d?w=800", // Soup
			Description: "红油羊杂碎，汤红肉鲜，辣香扑鼻，是宁夏人的标配早餐。",
			Price:       25,
			Rating:      4.8,
			Views:       1800,
			Status:      1,
		},
		{
			Name:        "宁夏酿皮",
			Category:    "小吃",
			Region:      "石嘴山市",
			CoverImage:  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", // Cold noodles
			Description: "口感劲道，调料丰富，酸辣爽口。",
			Price:       10,
			Rating:      4.5,
			Views:       1200,
			Status:      1,
		},
		{
			Name:        "八宝茶",
			Category:    "特色菜",
			Region:      "吴忠市",
			CoverImage:  "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800", // Tea
			Description: "以茶叶为底，加入红枣、枸杞、核桃仁、桂圆、芝麻、葡萄干等八种辅料，香甜可口。",
			Price:       58,
			Rating:      4.7,
			Views:       1500,
			Status:      1,
		},
	}
	db.CreateInBatches(foods, 10)

	fmt.Println("Data re-seeded successfully.")
}
