# 宁夏文旅小程序 - 商品商户系统设计规范 (Project Prompt)

> 本文档旨在指导 AI 助手（如 Cursor, Claude Code 等）进行代码生成与项目构建。
> **项目目标**：构建一个支持多商户、前后端分离的文旅电商系统。

---

## 1. 总体架构与技术栈

- **前端（C端）**：微信小程序 (Native / Canvas / WXML / WXSS)
- **商户后台（B端）**：React 18 + TypeScript + Ant Design 5 + Vite/CRA
- **后端（Server）**：Go 1.21+ + Gin + GORM + MySQL
- **资源存储**：对象存储 (OSS/COS)

---

## 2. 微信小程序设计 (C端)

> 核心目标：打造具有宁夏地域特色、流畅的购物体验。

### 2.1 商城首页 (Pages/Market/Index)
**布局结构**：
1.  **顶部导航栏 (Navbar)**：
    *   背景色：品牌主色（淡雅米白/大漠黄），支持透明渐变。
    *   **搜索框**：悬浮/胶囊样式，占位符"搜索特产/店铺..."，点击跳转搜索页。
2.  **分类导航 (Category Nav)**：
    *   横向滚动区 (ScrollView)。
    *   Item：图标 + 文字（如：特色美食、文创周边、旅游套票）。
3.  **营销展位 (Banner/Grid)**：
    *   轮播图或特惠专区（可选）。
4.  **商品瀑布流 (Product List)**：
    *   双列 Masonry 布局。
    *   **卡片组件 (ProductCard)**：
        *   `Image`: 宽高比 1:1 或 3:4，圆角 8px。
        *   `Title`: 双行省略，字体主要黑色。
        *   `Tags`: "热销", "新品"（左下角小标签）。
        *   `Price`: 红色/金赫色，突出显示。
        *   `ShopName`: 底部灰色小字，带箭头或图标。

### 2.2 店铺主页 (Pages/Shop/Index)
**布局结构**：
1.  **店铺头部 (ShopHeader)**：
    *   背景图：支持商户自定义（默认大漠/贺兰山风景）。
    *   **信息卡片**：
        *   `Logo`: 64x64 圆形头像。
        *   `Name`: 店铺名称，加粗。
        *   `Location`: 图标 + "银川市..."。
        *   `Stats`: 粉丝数 / 销量（可选）。
2.  **商品筛选栏 (Sticky Tabs)**：
    *   "全部", "销量", "价格", "分类"。
    *   吸顶效果。
3.  **商品列表**：
    *   复用商城首页的商品卡片样式，单列或双列可切换。

### 2.3 商品详情页 (Pages/Market/Detail)
**核心组件**：
1.  **轮播图 (Swiper)**：支持视频/图片，指示器。
2.  **信息区**：
    *   价格栏：大号价格 + 划线原价 + 销量。
    *   标题栏：加粗标题 + 分享按钮。
3.  **SKU 选择器**：底部弹窗 (ActionSheet)，选择规格/数量。
4.  **店铺入口栏**：展示店铺 Logo、名称、"进店逛逛"按钮。
5.  **详情内容**：富文本解析 (RichText)，图片需懒加载和宽度自适应。
6.  **底部操作栏**：
    *   左侧：客服、店铺、收藏。
    *   右侧：加入购物车（黄色）、立即购买（红色）。

---

## 3. React 商户后台设计 (B端)

> 核心目标：简洁、高效的店铺与商品管理工具。

### 3.1 布局框架 (Layout)
*   **侧边栏 (Sider)**：
    *   概览 (Dashboard)
    *   **店铺信息** (Shop Info) - *管理单一店铺的基础信息*
    *   商品列表 (Product List)
    *   发布商品 (Publish Product)
    *   订单管理 (Orders)
    *   用户管理 (Users) - *C端用户管理*
*   **面包屑与顶栏**：显示管理员信息与退出登录。

### 3.2 关键页面与组件

#### A. 店铺信息 (Single Shop Config)
*   **配置页**：单页表单，管理小程序的全局店铺展示信息。
*   **字段**：Logo、商城名称、联系电话、公告/简介。

#### B. 商品管理 (Product Management)
*   **商品列表**：
    *   筛选：按分类、状态、搜索名称。
    *   操作：批量上架/下架、删除。
*   **商品发布/编辑页**：
    *   富文本编辑器 + 多图上传。

---

## 4. Go 后端 API 设计

> 规范：RESTful, JSON Response, Snake_case DB fields, CamelCase JSON keys.
> **架构变更**：简化为单商户模式（Single Tenant），所有商品归属于平台。

### 4.1 数据模型 (Models - GORM)

```go
// Admin 管理员 (超级管理员)
type Admin struct {
    ID       uint   `gorm:"primarykey"`
    Username string `gorm:"unique;not null"`
    Password string `not null"` // Bcrypt hash
    LastLogin time.Time
}

// ShopInfo 店铺配置 (单例，或仅ID=1的记录)
type ShopInfo struct {
    ID          uint   `gorm:"primarykey"`
    Name        string `gorm:"size:100;default:'宁夏文旅商城'"`
    Logo        string
    Description string
}

// Product 商品
type Product struct {
    ID          uint   `gorm:"primarykey" json:"id"`
    // ShopID   uint   // 移除，默认归属平台
    CategoryID  uint   `json:"categoryId"`
    Name        string `gorm:"size:255;not null" json:"name"`
    Price       float64 `gorm:"type:decimal(10,2)" json:"price"`
    Stock       int    `json:"stock"`
    Images      []string `gorm:"type:json" json:"images"`
    Content     string `gorm:"type:longtext" json:"content"`
    IsOnline    bool   `gorm:"default:true" json:"isOnline"`
    Sales       int    `gorm:"default:0" json:"sales"`
}
```

### 4.2 API 路由定义 (Gin)

```go
v1 := r.Group("/api/v1")
{
    // 鉴权
    auth := v1.Group("/auth")
    {
        auth.POST("/login", AdminLogin)
    }

    // 后台管理接口 (需 AdminAuth 中间件)
    admin := v1.Group("/admin", AdminAuthMiddleware())
    {
        admin.GET("/dashboard", GetDashboardStats)
        admin.PUT("/shop-info", UpdateShopInfo) // 更新店铺配置
        
        // 商品管理
        admin.POST("/products", CreateProduct)
        admin.PUT("/products/:id", UpdateProduct)
        admin.GET("/products", GetProductList)
    }
}
```

### 4.3 扩展性设计
1.  **鉴权 (Auth)**：
    *   简化为单一 `Admin` 角色，无需复杂的 RBAC。
2.  **对象存储 (OSS)**：
    *   保持不变，支持图片上传。


---

## 5. 开发实施步骤建议

1.  **Phase 1 (Backend)**: 建立数据库，实现 Shop/Product 的 CRUD 接口，Swagger 文档。
2.  **Phase 2 (Admin)**: 搭建 React 框架，完成店长登录、店铺信息配置、商品录入功能。
3.  **Phase 3 (MiniApp)**: 完成商城聚合页 UI，联调商品列表接口，实现详情页渲染。
