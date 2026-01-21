package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
)

type RawAttraction struct {
	Name        string   `json:"name"`
	EnglishName string   `json:"englishName"`
	CoverImage  string   `json:"coverImage"`
	Images      []string `json:"images"`
	Grade       string   `json:"grade"`
	Category    string   `json:"category"`
	Region      string   `json:"region"`
	Address     string   `json:"address"`
	Description string   `json:"description"`
	Features    []string `json:"features"`
	OpenTime    string   `json:"openTime"`
	TicketPrice float64  `json:"ticketPrice"`
	Phone       string   `json:"phone"`
	Latitude    float64  `json:"latitude"`
	Longitude   float64  `json:"longitude"`
	Views       int      `json:"views"`
	Rating      float64  `json:"rating"`
	Recommend   bool     `json:"recommend"`
	Tags        []string `json:"tags"`
}

type RawFood struct {
	Name        string   `json:"name"`
	CoverImage  string   `json:"coverImage"`
	Images      []string `json:"images"`
	Category    string   `json:"category"`
	Region      string   `json:"region"`
	Description string   `json:"description"`
	Price       float64  `json:"price"`
	Shops       []string `json:"shops"`
	Views       int      `json:"views"`
	Rating      float64  `json:"rating"`
	Recommend   bool     `json:"recommend"`
	Tags        []string `json:"tags"`
}

type RawCulture struct {
	Name        string   `json:"name"`
	CoverImage  string   `json:"coverImage"`
	Images      []string `json:"images"`
	Category    string   `json:"category"`
	Region      string   `json:"region"`
	Description string   `json:"description"`
	Price       float64  `json:"price"`
	Views       int      `json:"views"`
	Rating      float64  `json:"rating"`
	Recommend   bool     `json:"recommend"`
	Tags        []string `json:"tags"`
}

var dataDir string

func init() {
	flag.StringVar(&dataDir, "dir", "../../../database", "数据文件目录")
}

func main() {
	flag.Parse()

	config.LoadConfig()

	if err := db.Connect(); err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	log.Println("开始导入数据...")

	if err := importAttractions(); err != nil {
		log.Printf("导入景点数据失败: %v", err)
	} else {
		log.Println("景点数据导入成功")
	}

	if err := importFood(); err != nil {
		log.Printf("导入美食数据失败: %v", err)
	} else {
		log.Println("美食数据导入成功")
	}

	if err := importCulture(); err != nil {
		log.Printf("导入文化数据失败: %v", err)
	} else {
		log.Println("文化数据导入成功")
	}

	log.Println("数据导入完成")
}

func importAttractions() error {
	data, err := os.ReadFile(fmt.Sprintf("%s/import-attractions.json", dataDir))
	if err != nil {
		return err
	}

	var rawList []RawAttraction
	if err := json.Unmarshal(data, &rawList); err != nil {
		return err
	}

	for _, raw := range rawList {
		var existing models.Attraction
		if err := db.DB.Where("name = ?", raw.Name).First(&existing).Error; err == nil {
			log.Printf("景点已存在，跳过: %s", raw.Name)
			continue
		}

		imagesJSON, _ := json.Marshal(raw.Images)
		featuresJSON, _ := json.Marshal(raw.Features)
		tagsJSON, _ := json.Marshal(raw.Tags)

		attraction := models.Attraction{
			Name:        raw.Name,
			EnglishName: raw.EnglishName,
			CoverImage:  raw.CoverImage,
			Images:      string(imagesJSON),
			Grade:       raw.Grade,
			Category:    raw.Category,
			Region:      raw.Region,
			Address:     raw.Address,
			Description: raw.Description,
			Features:    string(featuresJSON),
			OpenTime:    raw.OpenTime,
			TicketPrice: raw.TicketPrice,
			Phone:       raw.Phone,
			Latitude:    raw.Latitude,
			Longitude:   raw.Longitude,
			Views:       raw.Views,
			Rating:      raw.Rating,
			Recommend:   raw.Recommend,
			Tags:        string(tagsJSON),
			Status:      1,
		}

		if err := db.DB.Create(&attraction).Error; err != nil {
			log.Printf("创建景点失败: %s, 错误: %v", raw.Name, err)
		} else {
			log.Printf("景点导入成功: %s", raw.Name)
		}
	}

	return nil
}

func importFood() error {
	data, err := os.ReadFile(fmt.Sprintf("%s/import-food.json", dataDir))
	if err != nil {
		return err
	}

	var rawList []RawFood
	if err := json.Unmarshal(data, &rawList); err != nil {
		return err
	}

	for _, raw := range rawList {
		var existing models.Food
		if err := db.DB.Where("name = ?", raw.Name).First(&existing).Error; err == nil {
			log.Printf("美食已存在，跳过: %s", raw.Name)
			continue
		}

		imagesJSON := "[]"
		if raw.Images != nil {
			b, _ := json.Marshal(raw.Images)
			imagesJSON = string(b)
		}

		shopsJSON := "[]"
		if raw.Shops != nil {
			b, _ := json.Marshal(raw.Shops)
			shopsJSON = string(b)
		}

		tagsJSON := "[]"
		if raw.Tags != nil {
			b, _ := json.Marshal(raw.Tags)
			tagsJSON = string(b)
		}

		food := models.Food{
			Name:        raw.Name,
			CoverImage:  raw.CoverImage,
			Images:      string(imagesJSON),
			Category:    raw.Category,
			Region:      raw.Region,
			Description: raw.Description,
			Price:       raw.Price,
			Shops:       string(shopsJSON),
			Views:       raw.Views,
			Rating:      raw.Rating,
			Recommend:   raw.Recommend,
			Tags:        string(tagsJSON),
			Status:      1,
		}

		if err := db.DB.Create(&food).Error; err != nil {
			log.Printf("创建美食失败: %s, 错误: %v", raw.Name, err)
		} else {
			log.Printf("美食导入成功: %s", raw.Name)
		}
	}

	return nil
}

func importCulture() error {
	data, err := os.ReadFile(fmt.Sprintf("%s/import-culture.json", dataDir))
	if err != nil {
		return err
	}

	var rawList []RawCulture
	if err := json.Unmarshal(data, &rawList); err != nil {
		return err
	}

	for _, raw := range rawList {
		var existing models.Culture
		if err := db.DB.Where("name = ?", raw.Name).First(&existing).Error; err == nil {
			log.Printf("文化已存在，跳过: %s", raw.Name)
			continue
		}

		imagesJSON := "[]"
		if raw.Images != nil {
			b, _ := json.Marshal(raw.Images)
			imagesJSON = string(b)
		}

		tagsJSON := "[]"
		if raw.Tags != nil {
			b, _ := json.Marshal(raw.Tags)
			tagsJSON = string(b)
		}

		culture := models.Culture{
			Name:        raw.Name,
			CoverImage:  raw.CoverImage,
			Images:      string(imagesJSON),
			Category:    raw.Category,
			Region:      raw.Region,
			Description: raw.Description,
			Price:       raw.Price,
			Views:       raw.Views,
			Rating:      raw.Rating,
			Recommend:   raw.Recommend,
			Tags:        string(tagsJSON),
			Status:      1,
		}

		if err := db.DB.Create(&culture).Error; err != nil {
			log.Printf("创建文化失败: %s, 错误: %v", raw.Name, err)
		} else {
			log.Printf("文化导入成功: %s", raw.Name)
		}
	}

	return nil
}
