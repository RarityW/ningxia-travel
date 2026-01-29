package main

import (
	"log"
	"log/slog"
	"net/http"

	"os"
	"path/filepath"

	v1 "ningxia-wenlv-backend/api/v1"
	"ningxia-wenlv-backend/config"
	"ningxia-wenlv-backend/db"
	"ningxia-wenlv-backend/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	config.LoadConfig()

	// 设置全局 Logger
	setupLogger()

	// 连接数据库
	err := db.Connect()
	if err != nil {
		slog.Error("Database connection failed", "error", err)
		os.Exit(1)
	}

	// 创建 Gin 路由
	r := gin.Default()
	r.MaxMultipartMemory = 50 << 20 // 50MB

	// 中间件
	r.Use(middleware.RequestLogger()) // 添加日志中间件
	r.Use(middleware.CORSMiddleware())

	// 静态文件服务
	r.Static("/uploads", "./static/uploads")

	// Admin SPA Hosting (Catch-all for /admin to serve index.html for unknown files)
	r.GET("/admin/*filepath", func(c *gin.Context) {
		path := c.Param("filepath")

		// 1. Try to serve exact file from ./static/admin/
		localPath := filepath.Join("./static/admin", path)
		info, err := os.Stat(localPath)
		if err == nil && !info.IsDir() {
			c.File(localPath)
			return
		}

		// 2. Fallback to index.html for SPA routing
		c.File("./static/admin/index.html")
	})

	// Redirect root to /admin
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/admin")
	})

	// API v1 路由
	apiV1 := r.Group("/api/v1")
	{
		// 认证路由（不需要 JWT）
		auth := apiV1.Group("/auth")
		{
			auth.POST("/login", v1.Login)                // 小程序登录 (WeChat)
			auth.POST("/user/register", v1.UserRegister) // 用户注册 (Phone/Pwd)
			auth.POST("/user/login", v1.UserLogin)       // 用户登录 (Phone/Pwd)
			auth.POST("/admin/login", v1.AdminLogin)     // 管理员登录
		}

		// 景点路由
		attractions := apiV1.Group("/attractions")
		{
			attractions.GET("", v1.GetAttractions)    // 获取景点列表（分页）
			attractions.GET("/:id", v1.GetAttraction) // 获取景点详情
		}

		// 美食路由
		food := apiV1.Group("/food")
		{
			food.GET("", v1.GetFoods)    // 获取美食列表
			food.GET("/:id", v1.GetFood) // 获取美食详情
		}

		// 文化路由
		culture := apiV1.Group("/culture")
		{
			culture.GET("", v1.GetCultures)    // 获取文化列表
			culture.GET("/:id", v1.GetCulture) // 获取文化详情
		}

		// 商品路由
		market := apiV1.Group("/market")
		{
			market.GET("", v1.GetProducts)    // 获取商品列表
			market.GET("/:id", v1.GetProduct) // 获取商品详情
		}

		// 位置和天气服务（公开接口，无需登录）
		apiV1.GET("/location", v1.GetLocation) // 逆地理编码
		apiV1.GET("/weather", v1.GetWeather)   // 获取天气
		apiV1.GET("/search", v1.Search)        // 全局搜索

		// 商家无需登录即可注册
		apiV1.POST("/merchant/register", v1.RegisterMerchant)

		// 商家路由组 (需要管理员Auth)
		merchant := apiV1.Group("/merchant")
		merchant.Use(middleware.AdminAuthMiddleware())
		{
			merchant.GET("/profile", v1.GetMerchantProfile)
			merchant.PUT("/profile", v1.UpdateMerchantProfile)
		}

		// 用户路由（需要 JWT）
		user := apiV1.Group("/user")
		user.Use(middleware.AuthMiddleware())
		{
			user.GET("/profile", v1.GetUserProfile)          // 获取用户信息
			user.PUT("/profile", v1.UpdateProfile)           // 更新用户信息
			user.GET("/favorites", v1.GetFavorites)          // 获取收藏列表
			user.POST("/favorites", v1.AddFavorite)          // 添加收藏
			user.DELETE("/favorites/:id", v1.DeleteFavorite) // 删除收藏
			user.GET("/cart", v1.GetCart)                    // 获取购物车
			user.POST("/cart", v1.AddToCart)                 // 添加到购物车
			user.PUT("/cart/:id", v1.UpdateCart)             // 更新购物车
			user.DELETE("/cart/:id", v1.DeleteFromCart)      // 从购物车删除
			user.GET("/orders", v1.GetOrders)                // 获取订单列表
			user.POST("/orders", v1.CreateOrder)             // 创建订单
			user.GET("/orders/:id", v1.GetOrder)             // 获取订单详情
			user.POST("/orders/:id/pay", v1.PayOrder)        // 支付订单 (模拟)
			user.GET("/coupons", v1.GetCoupons)              // 获取优惠券列表
		}

		// 管理员路由（需要管理员 JWT）
		admin := apiV1.Group("/admin")
		admin.Use(middleware.AdminAuthMiddleware())
		{
			// 管理员信息
			admin.GET("/profile", v1.AdminGetProfile)

			// 景点管理
			admin.GET("/attractions", v1.AdminGetAttractions)
			admin.POST("/attractions", v1.AdminCreateAttraction)
			admin.PUT("/attractions/:id", v1.AdminUpdateAttraction)
			admin.DELETE("/attractions/:id", v1.AdminDeleteAttraction)

			// 美食管理
			admin.GET("/food", v1.AdminGetFoods)
			admin.POST("/food", v1.AdminCreateFood)
			admin.PUT("/food/:id", v1.AdminUpdateFood)
			admin.DELETE("/food/:id", v1.AdminDeleteFood)

			// 文化管理
			admin.GET("/culture", v1.AdminGetCultures)
			admin.POST("/culture", v1.AdminCreateCulture)
			admin.PUT("/culture/:id", v1.AdminUpdateCulture)
			admin.DELETE("/culture/:id", v1.AdminDeleteCulture)

			// 商品管理
			admin.GET("/products", v1.AdminGetProducts)
			admin.POST("/products", v1.AdminCreateProduct)
			admin.PUT("/products/:id", v1.AdminUpdateProduct)
			admin.DELETE("/products/:id", v1.AdminDeleteProduct)

			// 订单管理
			admin.GET("/orders", v1.AdminGetOrders)
			admin.PUT("/orders/:id/status", v1.AdminUpdateOrderStatus)

			// 统计数据
			admin.GET("/stats/overview", v1.AdminGetStats)

			// 优惠券管理
			admin.GET("/coupons", v1.AdminGetCoupons)
			admin.POST("/coupons", v1.AdminCreateCoupon)
			admin.PUT("/coupons/:id", v1.AdminUpdateCoupon)
			admin.DELETE("/coupons/:id", v1.AdminDeleteCoupon)

			// 商家管理
			admin.GET("/merchants", v1.AdminGetMerchants)
			admin.POST("/merchants", v1.AdminCreateMerchant)
			admin.PUT("/merchants/:id", v1.AdminUpdateMerchant)
			admin.DELETE("/merchants/:id", v1.AdminDeleteMerchant)

			// 文件上传
			admin.POST("/upload", v1.UploadFile)
		}

		// 小程序端店铺接口（公开）
		apiV1.GET("/merchants/:id", v1.GetMerchantDetail)
		apiV1.GET("/merchants/:id/products", v1.GetMerchantProducts)
	}

	// 启动服务器
	port := config.GlobalConfig.ServerPort
	log.Printf("Server starting on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupLogger() {
	var handler slog.Handler
	if config.GlobalConfig.ServerMode == "release" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})
	}
	logger := slog.New(handler)
	slog.SetDefault(logger)
}
