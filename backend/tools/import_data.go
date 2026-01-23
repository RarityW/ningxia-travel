package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
)

type Data struct {
	Products []ProductInput `json:"products"`
	Foods    []FoodInput    `json:"foods"`
}

type ProductInput struct {
	Name          string   `json:"name"`
	Category      string   `json:"category"`
	Price         float64  `json:"price"`
	OriginalPrice float64  `json:"original_price"`
	Stock         int      `json:"stock"`
	Description   string   `json:"description"`
	CoverImage    string   `json:"cover_image"`
	Images        []string `json:"images"`
	Specs         []string `json:"specifications"`
}

type FoodInput struct {
	Name        string   `json:"name"`
	Category    string   `json:"category"`
	Region      string   `json:"region"`
	Price       float64  `json:"price"`
	Description string   `json:"description"`
	CoverImage  string   `json:"cover_image"`
	Shops       []string `json:"shops"`
}

func main() {
	// 1. 初始化
	config.LoadConfig()
	if err := db.Connect(); err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	// 2. 读取 JSON 文件
	jsonFile, err := os.Open("tools/data.json")
	if err != nil {
		log.Fatal("无法打开 data.json:", err)
	}
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	var data Data
	if err := json.Unmarshal(byteValue, &data); err != nil {
		log.Fatal("JSON 解析失败:", err)
	}

	fmt.Printf("读取到 %d 个商品，%d 个美食\n", len(data.Products), len(data.Foods))

	// 3. 导入商品
	for _, p := range data.Products {
		imagesJSON, _ := json.Marshal(p.Images)
		specsJSON, _ := json.Marshal(p.Specs)

		product := models.Product{
			Name:           p.Name,
			Category:       p.Category,
			Price:          p.Price,
			OriginalPrice:  p.OriginalPrice,
			Stock:          p.Stock,
			Description:    p.Description,
			CoverImage:     p.CoverImage,
			Images:         string(imagesJSON),
			Specifications: string(specsJSON),
			Status:         1,
		}
		if err := db.DB.Create(&product).Error; err != nil {
			log.Printf("❌ 商品 [%s] 导入失败: %v\n", p.Name, err)
		} else {
			log.Printf("✅ 商品 [%s] 导入成功\n", p.Name)
		}
	}

	// 4. 导入美食
	for _, f := range data.Foods {
		shopsJSON, _ := json.Marshal(f.Shops)

		food := models.Food{
			Name:        f.Name,
			Category:    f.Category,
			Region:      f.Region,
			Price:       f.Price,
			Description: f.Description,
			CoverImage:  f.CoverImage,
			Shops:       string(shopsJSON),
			Status:      1,
		}
		if err := db.DB.Create(&food).Error; err != nil {
			log.Printf("❌ 美食 [%s] 导入失败: %v\n", f.Name, err)
		} else {
			log.Printf("✅ 美食 [%s] 导入成功\n", f.Name)
		}
	}

	fmt.Println("\n🎉 所有数据处理完成！")
}
