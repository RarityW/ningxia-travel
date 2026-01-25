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

	fmt.Println("=== 开始添加宁夏美食示例数据 ===")
	seedFoods()

	fmt.Println("\n=== 开始添加宁夏景区示例数据 ===")
	seedAttractions()

	fmt.Println("\n=== 数据填充完成 ===")
}

func seedFoods() {
	foods := []models.Food{
		{
			Name:        "老毛手抓·铜锅涮羊肉",
			Description: "百年老字号，国家级非物质文化遗产。主打手抓羊肉、铜锅涮羊肉、枸杞苗、小油香。地址：银川市解放东路99-1号（近鼓楼）",
			CoverImage:  "/uploads/food/laomao.jpg",
			Images:      "[\"/uploads/food/laomao.jpg\"]",
			Category:    "清真美食",
			Region:      "银川市",
			Price:       116,
			Tags:        "老字号,手抓羊肉,非遗",
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "宁味楼",
			Description: "主打宁夏本地特色牛羊肉，招牌香囊羊排需提前预定，羊肉无膻味。地址：银川市兴庆区凤凰北街580号，电话：0951-8935678",
			CoverImage:  "/uploads/food/ningweilou.jpg",
			Images:      "[\"/uploads/food/ningweilou.jpg\"]",
			Category:    "清真美食",
			Region:      "银川市",
			Price:       90,
			Tags:        "香囊羊排,本地特色",
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "阿叶羊杂碎（前进街店）",
			Description: "经典羊杂碎早餐，汤汁浓稠奶白，肉质弹牙劲道，配上烧饼味道更佳。地址：银川市前进街180号",
			CoverImage:  "/uploads/food/yangzasui.jpg",
			Images:      "[\"/uploads/food/yangzasui.jpg\"]",
			Category:    "特色小吃",
			Region:      "银川市",
			Price:       30,
			Tags:        "早餐,羊杂碎",
			Recommend:   false,
			Status:      1,
		},
		{
			Name:        "孟记小吃店",
			Description: "银川老字号凉皮店，酿皮口感绵润爽滑，酸辣可口。地址：银川市惠民巷（文化东街老二中旁）",
			CoverImage:  "/uploads/food/mengji.jpg",
			Images:      "[\"/uploads/food/mengji.jpg\"]",
			Category:    "特色小吃",
			Region:      "银川市",
			Price:       24,
			Tags:        "酿皮,凉皮",
			Recommend:   false,
			Status:      1,
		},
		{
			Name:        "三益轩",
			Description: "银川老字号，推荐碗蒸羊羔肉、炒糊饽、八宝茶。地址：银川市（多家分店）",
			CoverImage:  "/uploads/food/sanyixuan.jpg",
			Images:      "[\"/uploads/food/sanyixuan.jpg\"]",
			Category:    "清真美食",
			Region:      "银川市",
			Price:       60,
			Tags:        "老字号,羊羔肉",
			Recommend:   true,
			Status:      1,
		},
	}

	for _, food := range foods {
		if err := db.DB.Create(&food).Error; err != nil {
			fmt.Printf("添加美食失败 [%s]: %v\n", food.Name, err)
		} else {
			fmt.Printf("✓ 已添加美食: %s\n", food.Name)
		}
	}
}

func seedAttractions() {
	attractions := []models.Attraction{
		{
			Name:        "沙坡头旅游景区",
			Description: "中国最美的沙漠之一，集大漠、黄河、高山、绿洲为一体。有中国最大的天然滑沙场、黄河滑索和羊皮筏子等特色项目。",
			Address:     "中卫市沙坡头区迎水桥镇",
			TicketPrice: 100,
			OpenTime:    "08:00-18:00",
			CoverImage:  "/uploads/attractions/shapotou.jpg",
			Images:      "[\"/uploads/attractions/shapotou.jpg\"]",
			Category:    "自然风光",
			Region:      "中卫市",
			Grade:       "5A",
			Tags:        "5A景区,沙漠,黄河",
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "镇北堡西部影城",
			Description: "东方好莱坞，中国三大影视城之一。《大话西游》、《红高粱》等知名电影取景地。",
			Address:     "银川市西夏区镇北堡镇",
			TicketPrice: 100,
			OpenTime:    "08:00-18:00",
			CoverImage:  "/uploads/attractions/zhenbeibao.jpg",
			Images:      "[\"/uploads/attractions/zhenbeibao.jpg\"]",
			Category:    "人文景观",
			Region:      "银川市",
			Grade:       "5A",
			Tags:        "5A景区,影视城,大话西游",
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "西夏王陵",
			Description: "东方金字塔，西夏王朝皇家陵寝。包含9座帝陵和140多座陪葬墓，是中国现存规模最大的帝王陵园之一。",
			Address:     "银川市西郊贺兰山麓",
			TicketPrice: 75,
			OpenTime:    "08:00-18:30",
			CoverImage:  "/uploads/attractions/xixia.jpg",
			Images:      "[\"/uploads/attractions/xixia.jpg\"]",
			Category:    "历史遗迹",
			Region:      "银川市",
			Grade:       "4A",
			Tags:        "4A景区,世界遗产,西夏文化",
			Recommend:   true,
			Status:      1,
		},
		{
			Name:        "贺兰山岩画",
			Description: "中国游牧民族的艺术画廊，记录远古人类3000至10000年前的生产生活场景。",
			Address:     "银川市贺兰县贺兰山东麓贺兰口",
			TicketPrice: 70,
			OpenTime:    "08:00-18:00",
			CoverImage:  "/uploads/attractions/yanhua.jpg",
			Images:      "[\"/uploads/attractions/yanhua.jpg\"]",
			Category:    "历史遗迹",
			Region:      "银川市",
			Grade:       "4A",
			Tags:        "4A景区,岩画,远古文明",
			Recommend:   false,
			Status:      1,
		},
	}

	for _, attr := range attractions {
		if err := db.DB.Create(&attr).Error; err != nil {
			fmt.Printf("添加景区失败 [%s]: %v\n", attr.Name, err)
		} else {
			fmt.Printf("✓ 已添加景区: %s\n", attr.Name)
		}
	}
}
