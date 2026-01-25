package main

import (
	"fmt"
	"log"

	"ningxia-wenlv-backend/db"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// 尝试使用 localhost 而不是 127.0.0.1
	dsn := "root:123456Abc@tcp(localhost:3306)/ningxia_wenlv?charset=utf8mb4&parseTime=True&loc=Local"
	var err error
	db.DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("连接数据库失败:", err)
	}

	// 直接执行SQL删除
	if err := db.DB.Exec("DELETE FROM products").Error; err != nil {
		log.Fatal("删除商品失败:", err)
	}

	fmt.Println("Cleanup Success")
}
