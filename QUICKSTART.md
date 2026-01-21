# 宁夏文旅小程序 - 快速启动指南

## 项目结构

```
宁夏文旅小程序/
├── backend/              # Go后端服务
│   ├── api/v1/           # API接口
│   ├── config/           # 配置文件
│   ├── db/               # 数据库连接
│   ├── models/           # 数据模型
│   ├── tools/            # 工具脚本
│   └── main.go           # 主程序
├── pages/                # 小程序页面
│   ├── index/            # 首页
│   ├── attractions/      # 景点
│   ├── food/             # 美食
│   ├── culture/          # 文化
│   ├── market/           # 商城
│   ├── profile/          # 个人中心
│   ├── favorites/        # 收藏
│   └── cart/            # 购物车
├── utils/                # 工具函数
│   ├── api.js            # API配置
│   └── request.js        # 接口封装
├── database/             # 数据文件
└── app.js               # 小程序入口
```

## 快速启动

### 1. 后端服务启动

```bash
# 进入后端目录
cd backend

# 安装依赖（首次运行）
go mod download

# 配置数据库
# 创建 .env 文件或修改 config/config.go
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ningxia_wenlv

# 初始化管理员账号
cd tools
go run create_admin.go

# 导入宁夏数据
cd import
go run main.go -all

# 返回后端目录并启动服务
cd ../..
go run main.go
```

后端服务将在 `http://localhost:8080` 启动

默认管理员账号：
- 用户名：admin
- 密码：admin123

### 2. 小程序配置

```bash
# 修改后端地址
# 编辑 utils/api.js
const config = {
  baseURL: 'http://localhost:8080',  # 修改为实际后端地址
  apiVersion: '/api/v1'
}
```

### 3. 小程序开发

1. 打开微信开发者工具
2. 导入项目：选择 `宁夏文旅小程序` 目录
3. 修改 `project.config.json` 中的 appid
4. 点击"编译"按钮预览

## 主要功能

### 已完成功能

✅ 景点列表与详情
✅ 美食列表与详情
✅ 文化列表与详情
✅ 商品列表与详情
✅ 收藏功能
✅ 购物车功能
✅ 用户登录
✅ 个人中心

### 待完成功能

⬜ 订单管理
⬜ 优惠券功能
⬜ 管理后台

## API接口

### 认证
- `POST /api/v1/auth/login` - 小程序登录
- `POST /api/v1/auth/admin/login` - 管理员登录

### 景点
- `GET /api/v1/attractions` - 景点列表
- `GET /api/v1/attractions/:id` - 景点详情

### 美食
- `GET /api/v1/food` - 美食列表
- `GET /api/v1/food/:id` - 美食详情

### 文化
- `GET /api/v1/culture` - 文化列表
- `GET /api/v1/culture/:id` - 文化详情

### 商品
- `GET /api/v1/market` - 商品列表
- `GET /api/v1/market/:id` - 商品详情

### 用户
- `GET /api/v1/user/profile` - 用户信息
- `GET /api/v1/user/favorites` - 收藏列表
- `POST /api/v1/user/favorites` - 添加收藏
- `DELETE /api/v1/user/favorites/:id` - 取消收藏
- `GET /api/v1/user/cart` - 购物车
- `POST /api/v1/user/cart` - 加入购物车
- `PUT /api/v1/user/cart/:id` - 更新购物车
- `DELETE /api/v1/user/cart/:id` - 删除购物车
- `POST /api/v1/user/orders` - 创建订单

## 技术栈

### 后端
- Go 1.21+
- Gin Web框架
- GORM ORM
- MySQL 8.0+
- JWT认证

### 小程序
- 微信小程序原生开发
- 网络请求封装
- 本地存储管理

## 常见问题

### 1. 后端启动失败
- 检查MySQL服务是否启动
- 检查数据库配置是否正确
- 检查端口8080是否被占用

### 2. 小程序请求失败
- 检查后端服务是否启动
- 检查utils/api.js中的baseURL配置
- 检查网络连接

### 3. 登录失败
- 确保后端服务正常
- 检查JWT配置
- 查看后端日志

## 数据导入

```bash
cd backend/tools/import

# 导入所有数据
go run main.go -all

# 只导入景点
go run main.go -attractions

# 只导入美食
go run main.go -food

# 只导入文化
go run main.go -culture
```

## 开发计划

- [x] 项目结构搭建
- [x] 数据库设计
- [x] API接口开发
- [x] 小程序页面开发
- [x] 用户认证
- [x] 收藏功能
- [x] 购物车功能
- [ ] 订单管理
- [ ] 优惠券系统
- [ ] 管理后台
- [ ] 支付接口集成
- [ ] 数据统计分析

## 许可证

MIT License
