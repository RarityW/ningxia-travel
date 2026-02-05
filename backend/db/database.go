package db

import (
	"fmt"
	"log"
	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {
	cfg := config.GlobalConfig

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect database: %v", err)
	}

	// 自动迁移表
	err = DB.AutoMigrate(
		&models.User{},
		&models.Attraction{},
		&models.Food{},
		&models.Culture{},
		&models.Product{},
		&models.Order{},
		&models.Cart{},
		&models.Coupon{},
		&models.Admin{},
		&models.Merchant{},
		&models.FrontendAsset{},
	)

	if err != nil {
		return fmt.Errorf("failed to auto migrate: %v", err)
	}

	log.Println("Database connected successfully")
	return nil
}
