package main

import (
	"fmt"
	"log"
	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type MerchantData struct {
	CompanyName string
	BrandName   string
	Category    string
	Region      string
	Username    string // 拼音或缩写生成
}

var merchants = []MerchantData{
	{CompanyName: "宁夏承李记酒业有限公司", BrandName: "承李记", Category: "特色饮品(非遗)", Region: "银川市", Username: "chengliji"},
	{CompanyName: "宁夏日升祥商贸有限公司", BrandName: "月影三人", Category: "特色饮品", Region: "银川市", Username: "yueyingsanren"},
	{CompanyName: "银川市兴庆区小叶手抓", BrandName: "小叶手抓", Category: "特色食品类", Region: "银川市", Username: "xiaoyeshouzhua"},
	{CompanyName: "宁夏清穆食品有限公司", BrandName: "赛小北", Category: "特色食品类", Region: "银川贺兰县", Username: "saixiaobei"},
	{CompanyName: "宁夏全通枸杞供应链管理有限公司", BrandName: "杞果小圣", Category: "特色饮品类", Region: "银川市", Username: "qiguoxiaosheng"},
	{CompanyName: "宁夏邢者品牌设计策划有限公司", BrandName: "辛舍文创", Category: "旅游纪念品类", Region: "银川", Username: "xinshewenchuang"},
	{CompanyName: "贺兰石雕刻 (哈东)", BrandName: "雕刻", Category: "特色工艺品类(非遗)", Region: "银川市", Username: "helanshi"},
	{CompanyName: "银川市西夏区永亮印社贺兰石批发部", BrandName: "贺兰山", Category: "非遗文创类", Region: "银川市", Username: "helanshan"},
	{CompanyName: "宁夏巧玲科技有限公司", BrandName: "八宝茶", Category: "特色饮品类", Region: "银川市永宁县", Username: "babaocha"},
	{CompanyName: "宁夏金禧文化传媒有限公司", BrandName: "扎染", Category: "非遗文创类", Region: "银川市", Username: "zharan"},
}

func main() {
	config.LoadConfig()
	if err := db.Connect(); err != nil {
		log.Fatal("Database connection failed:", err)
	}

	fmt.Println("Starting to import 10 merchants...")
	password := "123456"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	for _, m := range merchants {
		err := db.DB.Transaction(func(tx *gorm.DB) error {
			// 1. Check if exists
			var count int64
			tx.Model(&models.Admin{}).Where("username = ?", m.Username).Count(&count)
			if count > 0 {
				fmt.Printf("Skipping %s (username %s exists)\n", m.BrandName, m.Username)
				return nil
			}

			// 2. Create Admin
			admin := models.Admin{
				Username: m.Username,
				Password: string(hashedPassword),
				Role:     3, // Merchant
				Status:   1, // Active
				Name:     m.BrandName,
			}
			if err := tx.Create(&admin).Error; err != nil {
				return err
			}

			// 3. Create Merchant Profile
			merchant := models.Merchant{
				AdminID: admin.ID,
				Name:    m.CompanyName, // Ensure company name is stored
				// Region field doesn't exist in model, map to Address
				Address: m.Region, // Initial address same as region
				Status:  1,        // Approved
			}
			if err := tx.Create(&merchant).Error; err != nil {
				return err
			}

			fmt.Printf("Created: %s (User: %s / Pass: 123456)\n", m.BrandName, m.Username)
			return nil
		})

		if err != nil {
			fmt.Printf("Failed to create %s: %v\n", m.BrandName, err)
		}
	}
	fmt.Println("Import finished.")
}
