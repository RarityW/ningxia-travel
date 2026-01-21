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
    log.Println("load config")
    config.LoadConfig()
    log.Println("connect db")
    if err := db.Connect(); err != nil {
        log.Fatal("Database connection failed:", err)
    }

    // 检查是否已存在
    log.Println("check existing admin")
    var existing models.Admin
    if err := db.DB.Where("username = ?", "admin").First(&existing).Error; err == nil {
        fmt.Printf("管理员 admin 已存在，ID: %d\n", existing.ID)
        return
    } else {
        log.Println("admin not found, will create")
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
    if err != nil {
        log.Fatal("密码加密失败:", err)
    }

    admin := models.Admin{
        Username: "admin",
        Password: string(hashedPassword),
        Name:     "超级管理员",
        Email:    "admin@ningxia.com",
        Role:     1,
        Status:   1,
    }

    log.Println("creating admin record")
    if err := db.DB.Create(&admin).Error; err != nil {
        log.Fatal("创建管理员失败:", err)
    }

    fmt.Println("管理员创建成功: admin / admin123")
}
