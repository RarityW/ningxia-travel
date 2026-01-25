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

	fmt.Println("Cleaning up data...")
	// Delete all products
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Product{}).Error; err != nil {
		log.Printf("Error deleting products: %v", err)
	} else {
		fmt.Println("Products cleared.")
	}

	// Delete all merchants
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Merchant{}).Error; err != nil {
		log.Printf("Error deleting merchants: %v", err)
	} else {
		fmt.Println("Merchants cleared.")
	}

	fmt.Println("Cleanup complete.")
}
