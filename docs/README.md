# 宁夏文旅项目

前后端分离架构的宁夏文化和旅游小程序项目。

## 项目结构

```
ningxia-travel/
├── miniprogram/          # 微信小程序前端
│   ├── pages/            # 页面文件
│   │   ├── index/        # 首页
│   │   ├── attractions/  # 景点展示
│   │   ├── food/         # 美食推荐
│   │   ├── culture/      # 文化介绍
│   │   ├── market/       # 门票优惠
│   │   ├── profile/      # 个人中心
│   │   ├── favorites/    # 收藏
│   │   └── cart/         # 购物车
│   ├── images/           # 图片资源
│   ├── utils/            # 工具函数
│   ├── components/       # 组件
│   ├── app.js            # 小程序入口
│   ├── app.json          # 配置
│   ├── app.wxss          # 全局样式
│   └── project.config.json
│
├── admin/                # 管理后台前端 (Vue.js)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/              # Go 后端服务
│   ├── api/              # API 处理器
│   ├── models/           # 数据模型
│   ├── config/           # 配置
│   ├── db/               # 数据库
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   ├── static/           # 静态文件
│   ├── main.go           # 入口文件
│   └── go.mod
│
├── database/             # 数据文件
│   ├── schema.md         # 数据库结构
│   └── import-*.json     # 初始数据
│
├── cloudfunctions/       # 微信云函数
│   └── attractions/
│
└── README.md
```

## 快速开始

### 小程序开发

1. 用微信开发者工具打开 `miniprogram/` 目录
2. 配置 AppID: `wxe8db933126040da4`
3. 开始开发

### 后端服务

```bash
cd backend
go run main.go
```

### 管理后台

```bash
cd admin
npm install
npm run dev
```

## 功能模块

### 小程序功能
- **首页**: 景点、美食、文化内容展示
- **景点**: 旅游景点列表和详情
- **美食**: 宁夏特色美食推荐
- **文化**: 非遗文化介绍
- **优惠**: 门票优惠活动
- **我的**: 个人中心

### API 接口
- `GET /api/attractions` - 景点列表
- `GET /api/attractions/:id` - 景点详情
- `GET /api/food` - 美食列表
- `GET /api/culture` - 文化列表
- `POST /api/login` - 用户登录

## 技术栈

- **小程序**: 原生微信小程序
- **后端**: Go + Gin
- **管理后台**: Vue.js
- **数据库**: MySQL

## 许可证

MIT
