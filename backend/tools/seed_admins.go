package main

import (
	"fmt"
	"ningxia-wenlv-backend/models"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
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

	// Password: admin123
	hashedPwd, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)

	admins := []models.Admin{
		{
			Username: "admin",
			Password: string(hashedPwd),
			Name:     "Super Admin",
			Role:     1, // Super Admin
			Status:   1,
		},
		{
			Username: "attr_admin",
			Password: string(hashedPwd),
			Name:     "Attraction Manager",
			Role:     2, // Attraction Admin (we will map this in frontend)
			Status:   1,
		},
		{
			Username: "prod_admin",
			Password: string(hashedPwd),
			Name:     "Product Manager",
			Role:     3, // Product Admin (we will map this in frontend)
			Status:   1,
		},
	}

	fmt.Println("Seeding admins...")
	// Clear existing admins first to avoid duplicates if re-running
	db.Exec("TRUNCATE TABLE admins")

	for _, admin := range admins {
		if err := db.Create(&admin).Error; err != nil {
			fmt.Printf("Failed to create admin %s: %v\n", admin.Username, err)
		} else {
			fmt.Printf("Created admin: %s (Role: %d)\n", admin.Username, admin.Role)
		}
	}

	// Create a demo merchant for the product admin
	// Note: In real logic, we associate by AdminID.
	// Let's find the created prod_admin first to get ID
	var prodAdmin models.Admin
	db.Where("username = ?", "prod_admin").First(&prodAdmin)

	merchant := models.Merchant{
		AdminID: prodAdmin.ID,
		Name:    "Demo Shop",
		Phone:   "13800000000",
		Address: "Ningxia",
		Status:  1,
	}
	db.Create(&merchant)
	fmt.Printf("Created merchant for prod_admin (MerchantID: %d)\n", merchant.ID)

	fmt.Println("Done.")
}
