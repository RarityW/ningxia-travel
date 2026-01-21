package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/models"
)

func main() {
	log.Println("加载配置...")
	config.LoadConfig()

	log.Println("连接数据库...")
	if err := db.Connect(); err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	// 查找管理员
	var admin models.Admin
	if err := db.DB.Where("username = ?", "admin").First(&admin).Error; err != nil {
		log.Fatal("管理员不存在:", err)
	}

	// 新密码
	newPassword := "Admin@2024"
	log.Printf("正在更新管理员 %s 的密码...", admin.Username)

	// 生成新密码哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("密码加密失败:", err)
	}

	// 更新密码
	if err := db.DB.Model(&admin).Update("password", string(hashedPassword)).Error; err != nil {
		log.Fatal("密码更新失败:", err)
	}

	fmt.Printf("✅ 管理员密码更新成功!\n")
	fmt.Printf("用户名: %s\n", admin.Username)
	fmt.Printf("新密码: %s\n", newPassword)
	fmt.Println("\n请妥善保管新密码!")
}
