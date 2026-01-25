package main

import (
	"fmt"
	"ningxia-wenlv-backend/models"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// Standalone cleanup script
func main() {
	// 0. Load .env
	_ = godotenv.Load() // Ignore error if not found, rely on defaults/env

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

	// 1. Connect to DB
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, pass, host, port, name)

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	fmt.Println("Starting database cleanup/reset...")

	// 2. Truncate Tables
	// Be careful with foreign key constraints; usually formatting specific order or disabling checks helps.
	database.Exec("SET FOREIGN_KEY_CHECKS = 0")

	// 2. Drop and Re-create Tables (Cleaner than Truncate for FKs)
	// We want to clear: Users, Merchants, Products, Orders, OrderItems, Carts
	// We KEEP: Admins, Attractions, Foods, Cultures (unless user wants to clear those too, but prompt said "商铺数据" and "测试用户")

	// Dropping in order of dependencies (child first)
	toDrop := []interface{}{
		&models.Cart{},
		&models.OrderItem{},
		&models.Order{},
		&models.Product{},
		&models.Merchant{},
		&models.User{},
	}

	fmt.Println("Dropping tables...")
	if err := database.Migrator().DropTable(toDrop...); err != nil {
		fmt.Printf("Failed to drop tables: %v\n", err)
	}

	fmt.Println("Migrating tables (re-creating)...")
	if err := database.AutoMigrate(toDrop...); err != nil {
		panic(fmt.Sprintf("Failed to migrate: %v", err))
	}

	database.Exec("SET FOREIGN_KEY_CHECKS = 1")

	// 3. Reset/Seed Admins
	// We want 3 roles: Super Admin (1), Attraction Admin (2), Product Admin (3)
	// First, clear existing admins
	// database.Exec("TRUNCATE TABLE admins") // Uncomment if you want to wipe all admins too

	fmt.Println("Database cleanup completed.")
}
