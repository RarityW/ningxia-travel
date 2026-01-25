package main

import (
	"fmt"
	"log"
	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	config.LoadConfig()
	cfg := config.GlobalConfig
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Running AutoMigrate...")
	err = db.AutoMigrate(&models.Merchant{}, &models.Product{})
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
	fmt.Println("Migration successful.")

	// Check columns
	if db.Migrator().HasColumn(&models.Merchant{}, "logo") {
		fmt.Println("Column 'logo' exists in 'merchants'.")
	} else {
		fmt.Println("Column 'logo' MISSING in 'merchants'.")
		// Try manual AddColumn
		db.Migrator().AddColumn(&models.Merchant{}, "Logo")
	}
}
