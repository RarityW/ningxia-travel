package main

import (
	"log"
	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
)

func main() {
	// 加载配置
	config.LoadConfig()

	// 连接数据库
	err := db.Connect()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}

	// 1. 宁夏美食数据
	foods := []models.Food{
		{
			Name:        "手抓羊肉",
			CoverImage:  "/uploads/food_shouzhua.jpg", // 需自行准备图片或使用网络占位符
			Category:    "特色菜",
			Region:      "全区",
			Description: "选用优质滩羊肉，清蒸烹制，保留原汁原味，肉质鲜嫩不膻，搭配蒜泥醋食用。",
			Price:       88.00,
			Rating:      4.9,
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "羊杂碎",
			CoverImage:  "/uploads/food_yangzasui.jpg",
			Category:    "小吃",
			Region:      "银川",
			Description: "羊头肉、羊肚、羊心等浸泡在羊汤中，淋上羊油辣椒，味道醇厚鲜美，是当地著名早餐。",
			Price:       25.00,
			Rating:      4.8,
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "辣糊糊",
			CoverImage:  "/uploads/food_lahuhu.jpg",
			Category:    "特色菜",
			Region:      "银川",
			Description: "类似火锅，汤底由辣面子熬制，浓稠香辣，涮入各种新鲜食材，冬季必吃。",
			Price:       58.00,
			Rating:      4.7,
			Recommend:   false,
			Status:      1,
		},
		{
			Name:        "烤全羊",
			CoverImage:  "/uploads/food_kaoquanyang.jpg",
			Category:    "特色菜",
			Region:      "全区",
			Description: "选用50天左右滩羊，慢火细烤至金黄酥脆，肉质嫩熟，招待贵宾首选。",
			Price:       1280.00,
			Rating:      5.0,
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "八宝茶",
			CoverImage:  "/uploads/food_babaocha.jpg",
			Category:    "饮品",
			Region:      "全区",
			Description: "茶叶、冰糖、枸杞、红枣、桂圆、核桃仁等冲泡，宁夏独特传统的待客茶饮。",
			Price:       15.00,
			Rating:      4.6,
			Recommend:   true,
			Status:      1,
		},
	}

	for _, f := range foods {
		if err := db.DB.FirstOrCreate(&f, models.Food{Name: f.Name}).Error; err != nil {
			log.Printf("Failed to seed food %s: %v", f.Name, err)
		} else {
			log.Printf("Seeded food: %s", f.Name)
		}
	}

	// 2. 宁夏景点数据
	attractions := []models.Attraction{
		{
			Name:        "沙坡头",
			CoverImage:  "/uploads/attr_shapotou.jpg",
			Grade:       "5A",
			Category:    "自然",
			Region:      "中卫",
			Address:     "中卫市城区以西16公里腾格里沙漠东南边缘",
			Description: "融合沙漠、黄河、高山、绿洲的壮丽景色，有滑沙、羊皮筏子等特色项目。",
			TicketPrice: 100.00,
			Rating:      4.9,
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "镇北堡西部影城",
			CoverImage:  "/uploads/attr_zhenbeibu.jpg",
			Grade:       "5A",
			Category:    "文化",
			Region:      "银川",
			Address:     "银川市西夏区镇北堡",
			Description: "被誉为“东方好莱坞”，古朴原始风格，大话西游等众多影视剧拍摄地。",
			TicketPrice: 80.00,
			Rating:      4.8,
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "沙湖",
			CoverImage:  "/uploads/attr_shahu.jpg",
			Grade:       "5A",
			Category:    "自然",
			Region:      "石嘴山",
			Address:     "石嘴山市平罗县",
			Description: "集沙、水、苇、鸟、山于一体，融江南秀色与塞外壮景。",
			TicketPrice: 50.00,
			Rating:      4.7,
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "西夏王陵",
			CoverImage:  "/uploads/attr_xixia.jpg",
			Grade:       "4A",
			Category:    "历史",
			Region:      "银川",
			Address:     "银川市西郊贺兰山麓",
			Description: "西夏王朝皇家陵寝，被称为“东方金字塔”，现存规模宏大。",
			TicketPrice: 75.00,
			Rating:      4.6,
			Recommend:   false,
			Status:      1,
		},
		{
			Name:        "水洞沟",
			CoverImage:  "/uploads/attr_shuidonggou.jpg",
			Grade:       "5A",
			Category:    "历史",
			Region:      "灵武",
			Address:     "银川市灵武市临河镇",
			Description: "独特的雅丹地貌和三万年前古人类生存遗迹。",
			TicketPrice: 95.00,
			Rating:      4.7,
			Recommend:   false,
			Status:      1,
		},
	}

	for _, a := range attractions {
		if err := db.DB.FirstOrCreate(&a, models.Attraction{Name: a.Name}).Error; err != nil {
			log.Printf("Failed to seed attraction %s: %v", a.Name, err)
		} else {
			log.Printf("Seeded attraction: %s", a.Name)
		}
	}

	log.Println("Seeding completed!")
}
