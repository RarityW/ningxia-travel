package main

import (
	"fmt"
	"ningxia-wenlv-backend/models"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// 0. Load .env
	_ = godotenv.Load()

	// 1. Connect to DB
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

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, pass, host, port, name)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	fmt.Println("Starting targeted cleanup...")

	// 2. Delete all Users (Frontend) and Cascaded Data
	// Ensure GORM knows to cleanup related if configured, or just delete child tables first manually
	// Deleting users
	fmt.Println("Deleting all Frontend Users...")
	db.Exec("DELETE FROM carts")
	db.Exec("DELETE FROM order_items")
	db.Exec("DELETE FROM orders")
	db.Exec("DELETE FROM favorites") // Assuming favorites table exists
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.User{}).Error; err != nil {
		fmt.Printf("Error deleting users: %v\n", err)
	} else {
		fmt.Println("All users deleted.")
	}

	// 3. Delete non-admin Admins & their Merchants & Products
	// Retrieve "Super Admin" ID to safeguard
	var superAdmin models.Admin
	db.Where("username = ?", "admin").First(&superAdmin)

	if superAdmin.ID == 0 {
		fmt.Println("Warning: Super admin 'admin' not found. Creating it...")
		// Only if needed, but usually we just want to avoid deleting if it exists
	}

	fmt.Println("Deleting non-super Admins...")

	// Find admins to delete
	var adminsToDelete []models.Admin
	db.Where("username != ?", "admin").Find(&adminsToDelete)

	for _, admin := range adminsToDelete {
		// Delete Merchant Profile
		var merchant models.Merchant
		if err := db.Where("admin_id = ?", admin.ID).First(&merchant).Error; err == nil {
			// Delete Products of this merchant
			fmt.Printf("Deleting products for merchant %s...\n", merchant.Name)
			db.Where("merchant_id = ?", merchant.ID).Delete(&models.Product{})

			// Delete Merchant
			fmt.Printf("Deleting merchant %s...\n", merchant.Name)
			db.Delete(&merchant)
		}

		// Delete Admin
		fmt.Printf("Deleting admin %s...\n", admin.Username)
		db.Delete(&admin)
	}

	fmt.Println("Cleanup completed. Keeping content (Food/Attractions) and super admin.")
}
