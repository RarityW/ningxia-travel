# 宁夏文旅小程序 - Go 后端

## 项目介绍

宁夏文旅小程序的 Go 语言后端服务，提供 RESTful API、MySQL 数据库、JWT 认证、文件上传，以及网页端管理系统。

## 技术栈

- **Web框架**：Gin
- **ORM**：GORM
- **数据库**：MySQL 8.0+
- **认证**：JWT
- **Go版本**：1.21+

## 项目结构

```
backend/
├── api/v1/            # API 控制器
│   ├── auth.go       # 认证相关
│   ├── content.go    # 内容管理
├── config/           # 配置
│   ├── config.go
├── db/               # 数据库
│   └── database.go
├── middleware/       # 中间件
│   └── auth.go
├── models/           # 数据模型
│   └── models.go
├── utils/            # 工具函数
│   ├── jwt.go
│   └── response.go
├── static/           # 静态文件
│   ├── uploads/       # 上传文件
│   └── admin/         # 管理系统前端
├── .env.example       # 环境变量示例
├── go.mod
└── main.go            # 主入口
```

## 快速开始

### 1. 安装依赖

```bash
go mod download
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
SERVER_PORT=8080
SERVER_MODE=debug

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ningxia_wenlv

# JWT 配置
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE_HOURS=24

# 文件上传配置
UPLOAD_PATH=./static/uploads
MAX_FILE_SIZE=10485760

# 跨域配置
CORS_ALLOW_ORIGINS=*
```

### 3. 创建数据库

```sql
CREATE DATABASE ninxia_wenlv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 初始化管理员账号

```bash
cd tools
go run create_admin.go
```

默认管理员账号：
- 用户名：admin
- 密码：admin123

### 5. 导入宁夏真实数据

```bash
cd tools/import
go run main.go -all
```

数据导入工具说明：
- `-all`: 导入所有数据（景点、美食、文化）
- `-attractions`: 只导入景点数据
- `-food`: 只导入美食数据
- `-culture`: 只导入文化数据
- `-dir`: 指定数据文件目录（默认：../../database）

示例：
```bash
# 导入所有数据
go run main.go -all

# 只导入景点数据
go run main.go -attractions

# 指定数据目录
go run main.go -all -dir /path/to/database
```

### 6. 运行服务器

```bash
go run main.go
```

服务器将在 `http://localhost:8080` 启动

## API 文档

### 认证接口

#### 小程序登录
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "openid": "用户openid",
  "nickname": "用户昵称",
  "avatar": "头像URL",
  "gender": 1
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "user_id": 1,
    "openid": "openid",
    "nickname": "昵称"
  }
}
```

#### 管理员登录
```
POST /api/v1/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### 景点接口

#### 获取景点列表
```
GET /api/v1/attractions?page=1&page_size=10&category=all&keyword=
```

#### 获取景点详情
```
GET /api/v1/attractions/:id
Header: Authorization: Bearer {token}
```

### 美食接口

#### 获取美食列表
```
GET /api/v1/food?page=1&page_size=10&category=all&keyword=
```

#### 获取美食详情
```
GET /api/v1/food/:id
```

### 文化接口

#### 获取文化列表
```
GET /api/v1/culture?page=1&page_size=10&category=all&keyword=
```

#### 获取文化详情
```
GET /api/v1/culture/:id
```

### 商品接口

#### 获取商品列表
```
GET /api/v1/market?page=1&page_size=10&category=all&keyword=
```

#### 获取商品详情
```
GET /api/v1/market/:id
```

### 用户接口（需要 JWT 认证）

#### 获取用户信息
```
GET /api/v1/user/profile
Header: Authorization: Bearer {token}
```

#### 获取购物车
```
GET /api/v1/user/cart
Header: Authorization: Bearer {token}
```

#### 添加到购物车
```
POST /api/v1/user/cart
Header: Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 1
}
```

#### 创建订单
```
POST /api/v1/user/orders
Header: Authorization: Bearer {token}
Content-Type: application/json

{
  "address": "收货地址",
  "remark": "备注"
}
```

### 管理员接口（需要管理员 JWT）

#### 创建景点
```
POST /api/v1/admin/attractions
Header: Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "沙坡头景区",
  "english_name": "Shapotou Scenic Area",
  "cover_image": "https://example.com/image.jpg",
  "grade": "5A",
  "category": "自然",
  "region": "中卫市",
  "address": "宁夏中卫市沙坡头区",
  "description": "景点介绍",
  "features": ["沙漠滑沙", "黄河漂流"],
  "open_time": "08:00-18:00",
  "ticket_price": 80,
  "phone": "0955-7689333",
  "latitude": 37.5167,
  "longitude": 105.0167,
  "rating": 4.8,
  "recommend": true,
  "tags": ["沙漠", "黄河"],
  "status": 1
}
```

#### 上传文件
```
POST /api/v1/admin/upload
Header: Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

file: (binary)
```

## 数据库表结构

### users（用户表）
- id
- openid (唯一索引）
- nickname
- avatar
- gender
- phone
- is_active
- created_at
- updated_at
- deleted_at

### attractions（景点表）
- id
- name
- english_name
- cover_image
- images (JSON数组)
- grade (5A/4A/3A)
- category (自然/历史/文化)
- region
- address
- description
- features (JSON数组)
- open_time
- ticket_price
- phone
- latitude
- longitude
- views
- rating
- recommend
- tags (JSON数组)
- status
- created_at
- updated_at
- deleted_at

### food（美食表）
- id
- name
- cover_image
- images (JSON数组)
- category (特色菜/小吃/主食)
- region
- description
- price
- shops (JSON数组)
- views
- rating
- recommend
- status
- created_at
- updated_at
- deleted_at

### culture（文化/非遗表）
- id
- name
- cover_image
- images (JSON数组)
- category (非遗/文创/工艺品)
- region
- description
- price
- views
- rating
- recommend
- status
- created_at
- updated_at
- deleted_at

### products（商品表）
- id
- name
- cover_image
- images (JSON数组)
- category (明星产品/特色食品/文创周边)
- price
- original_price
- description
- sales
- stock
- specifications (JSON数组)
- status
- created_at
- updated_at
- deleted_at

### orders（订单表）
- id
- order_no (唯一索引)
- user_id
- total_price
- status (0:待支付 1:已支付 2:已发货 3:已完成 4:已取消)
- pay_time
- ship_time
- address
- remark
- created_at
- updated_at
- deleted_at

### order_items（订单明细表）
- id
- order_id
- product_id
- quantity
- price

### cart（购物车表）
- id
- user_id
- product_id
- quantity
- spec_id
- created_at
- updated_at

### coupons（优惠券表）
- id
- name
- type (1:满减 2:折扣)
- min_amount
- discount
- total
- used
- start_time
- end_time
- status
- created_at
- updated_at
- deleted_at

### admins（管理员表）
- id
- username (唯一索引)
- password
- name
- email
- role (1:超级管理员 2:普通管理员)
- status
- created_at
- updated_at

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
| 1001 | 用户不存在 |
| 1002 | 用户已存在 |
| 1003 | 登录失败 |
| 1004 | 无效令牌 |
| 2001 | 商品库存不足 |
| 3001 | 订单不存在 |
| 3002 | 购物车为空 |

## 部署

### Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
EXPOSE 8080

CMD ["./main"]
```

构建并运行：

```bash
docker build -t ninxia-wenlv-backend .
docker run -p 8080:8080 -e DB_HOST=host.docker.internal -e DB_PASSWORD=password ninxia-wenlv-backend
```

### 生产环境配置

1. 修改 `JWT_SECRET` 为强密码
2. 修改数据库密码
3. 设置 `SERVER_MODE=production`
4. 配置 HTTPS
5. 配置域名白名单

## 开发计划

- [x] 项目结构搭建
- [x] 数据库模型设计
- [x] 用户认证（JWT）
- [x] 景点 API
- [x] 美食 API
- [x] 文化 API
- [x] 商品 API
 - [x] 订单管理
 - [x] 购物车功能
 - [x] 管理系统前端
 - [ ] 文件上传优化（OSS）
 - [ ] 支付接口集成
 - [x] 数据导入工具

## 许可证

MIT License
