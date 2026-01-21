package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
)

func main() {
	importAll := flag.Bool("all", false, "导入所有数据")
	importAttractionsFlag := flag.Bool("attractions", false, "只导入景点数据")
	importFoodFlag := flag.Bool("food", false, "只导入美食数据")
	importCultureFlag := flag.Bool("culture", false, "只导入文化数据")
	dataDir := flag.String("dir", "../../database", "数据文件目录")

	flag.Parse()

	if !*importAll && !*importAttractionsFlag && !*importFoodFlag && !*importCultureFlag {
		fmt.Println("使用方法:")
		fmt.Println("  -all: 导入所有数据")
		fmt.Println("  -attractions: 只导入景点数据")
		fmt.Println("  -food: 只导入美食数据")
		fmt.Println("  -culture: 只导入文化数据")
		fmt.Println("  -dir: 指定数据文件目录 (默认: ../../database)")
		os.Exit(1)
	}

	log.Println("开始导入数据...")

	config.LoadConfig()

	if err := db.Connect(); err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	if *importAll || *importAttractionsFlag {
		if err := importAttractionsData(*dataDir); err != nil {
			log.Printf("导入景点数据失败: %v", err)
		} else {
			log.Println("景点数据导入成功")
		}
	}

	if *importAll || *importFoodFlag {
		if err := importFoodData(*dataDir); err != nil {
			log.Printf("导入美食数据失败: %v", err)
		} else {
			log.Println("美食数据导入成功")
		}
	}

	if *importAll || *importCultureFlag {
		if err := importCultureData(*dataDir); err != nil {
			log.Printf("导入文化数据失败: %v", err)
		} else {
			log.Println("文化数据导入成功")
		}
	}

	log.Println("数据导入完成")
}

func importAttractionsData(dataDir string) error {
	file, err := os.Open(filepath.Join(dataDir, "import-attractions.json"))
	if err != nil {
		return fmt.Errorf("打开文件失败: %v", err)
	}
	defer file.Close()

	var attractions []models.Attraction
	if err := json.NewDecoder(file).Decode(&attractions); err != nil {
		return fmt.Errorf("解析JSON失败: %v", err)
	}

	for _, attraction := range attractions {
		var existing models.Attraction
		if err := db.DB.Where("name = ?", attraction.Name).First(&existing).Error; err == nil {
			log.Printf("景点已存在，跳过: %s", attraction.Name)
			continue
		}

		if err := db.DB.Create(&attraction).Error; err != nil {
			log.Printf("创建景点失败: %s, 错误: %v", attraction.Name, err)
			continue
		}
		log.Printf("景点导入成功: %s", attraction.Name)
	}

	return nil
}

func importFoodData(dataDir string) error {
	file, err := os.Open(filepath.Join(dataDir, "import-food.json"))
	if err != nil {
		return fmt.Errorf("打开文件失败: %v", err)
	}
	defer file.Close()

	var foods []models.Food
	if err := json.NewDecoder(file).Decode(&foods); err != nil {
		return fmt.Errorf("解析JSON失败: %v", err)
	}

	for _, food := range foods {
		var existing models.Food
		if err := db.DB.Where("name = ?", food.Name).First(&existing).Error; err == nil {
			log.Printf("美食已存在，跳过: %s", food.Name)
			continue
		}

		if err := db.DB.Create(&food).Error; err != nil {
			log.Printf("创建美食失败: %s, 错误: %v", food.Name, err)
			continue
		}
		log.Printf("美食导入成功: %s", food.Name)
	}

	return nil
}

func importCultureData(dataDir string) error {
	file, err := os.Open(filepath.Join(dataDir, "import-culture.json"))
	if err != nil {
		return fmt.Errorf("打开文件失败: %v", err)
	}
	defer file.Close()

	var cultures []models.Culture
	if err := json.NewDecoder(file).Decode(&cultures); err != nil {
		return fmt.Errorf("解析JSON失败: %v", err)
	}

	for _, culture := range cultures {
		var existing models.Culture
		if err := db.DB.Where("name = ?", culture.Name).First(&existing).Error; err == nil {
			log.Printf("文化已存在，跳过: %s", culture.Name)
			continue
		}

		if err := db.DB.Create(&culture).Error; err != nil {
			log.Printf("创建文化失败: %s, 错误: %v", culture.Name, err)
			continue
		}
		log.Printf("文化导入成功: %s", culture.Name)
	}

	return nil
}
