# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

宁夏文旅小程序是一个基于微信云开发的宁夏文化旅游小程序，主要展示宁夏的景点、美食和文化内容。

## Architecture

### Frontend (微信小程序)
- **小程序框架**: 微信原生小程序框架
- **目录结构**:
  - `pages/` - 页面文件
    - `index/` - 首页
    - `attractions/` - 景点相关页面
    - `food/` - 美食相关页面
    - `culture/` - 文化相关页面
  - `components/` - 自定义组件
  - `utils/` - 工具函数
  - `images/` - 图片资源
  - `app.js/app.json/app.wxss` - 小程序入口配置

### Backend (微信云函数)
- **云函数目录**: `cloudfunctions/`
  - `attractions/` - 景点列表云函数
  - `attractions/detail/` - 景点详情云函数
- **数据库**: 微信云开发数据库
  - `attractions` - 景点表
  - `food` - 美食表
  - `culture` - 文化/文创表
  - `users` - 用户表

### Database Schema
数据库设计文档位于 `database/schema.md`

### Sample Data
示例数据位于 `database/sample-data.json`，包含8个宁夏景点和示例美食数据

## Development

### Initial Setup

1. 修改 `app.js` 中的云开发环境ID:
```javascript
wx.cloud.init({
  env: 'your-env-id', // 替换为实际环境ID
  traceUser: true,
});
```

2. 修改 `project.config.json` 中的 appid:
```json
"appid": "your-appid"
```

### Cloud Functions

部署云函数:
```bash
# 在微信开发者工具中右键云函数目录 -> 上传并部署
```

云函数使用 `wx-server-sdk` v2.6.3

### Database Initialization

1. 在微信云开发控制台创建集合: `attractions`, `food`, `culture`, `users`
2. 导入 `database/sample-data.json` 中的数据到对应集合

### Project Configuration

- `app.json` - 定义页面路径、导航栏样式、tabBar配置
- `project.config.json` - 项目配置，包括 appid、云开发环境等
- `sitemap.json` - 小程序索引配置

### Current Implemented Features

- 首页: 轮播图、快捷入口、热门景点、宁夏特色、推荐美食
- 景点列表: 分类筛选、下拉刷新、上拉加载更多
- 景点详情: 图片轮播、景点信息、收藏功能

### Page Structure

小程序页面采用标准四文件结构:
- `.wxml` - 页面结构
- `.wxss` - 页面样式
- `.js` - 页面逻辑
- `.json` - 页面配置

### Cloud Function Call Pattern

```javascript
const result = await wx.cloud.callFunction({
  name: 'function-name',
  data: {
    // 参数
  }
});

if (result.result.success) {
  // 处理成功
}
```

### Styling Conventions

- 主色调: `#8B4513` (棕色)
- 圆角: `16rpx` (卡片)、`8rpx` (小元素)
- 字体: 使用 rpx 单位，基准 32rpx
- 阴影: `0 2rpx 8rpx rgba(0, 0, 0, 0.08)`
