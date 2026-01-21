# 首页图标文件说明

## 需要准备的图标文件

### 功能入口图标（6个）
需要准备彩色图标，建议尺寸：88x88px

| 文件名 | 说明 |
|--------|------|
| /assets/feiyi.png | 非遗图标 |
| /assets/wenchuang.png | 文创图标 |
| /assets/jingqu.png | 景区图标 |
| /assets/jiudian.png | 酒店图标 |
| /assets/minsu.png | 民宿图标 |
| /assets/meishi.png | 美食图标 |

## 临时解决方案

如果暂时没有图标，可以使用以下方式：

### 方案一：使用占位图
修改 index.js 中的 functionIcons 数组，将图标路径改为占位图：
```javascript
functionIcons: [
  { id: 1, name: '非遗', icon: 'https://via.placeholder.com/88x88/DC143C/FFFFFF?text=非遗', page: '/pages/culture/list' },
  { id: 2, name: '文创', icon: 'https://via.placeholder.com/88x88/4169E1/FFFFFF?text=文创', page: '/pages/culture/list' },
  { id: 3, name: '景区', icon: 'https://via.placeholder.com/88x88/228B22/FFFFFF?text=景区', page: '/pages/attractions/list' },
  { id: 4, name: '酒店', icon: 'https://via.placeholder.com/88x88/FF9500/FFFFFF?text=酒店', page: '' },
  { id: 5, name: '民宿', icon: 'https://via.placeholder.com/88x88/5856D6/FFFFFF?text=民宿', page: '' },
  { id: 6, name: '美食', icon: 'https://via.placeholder.com/88x88/FF3B30/FFFFFF?text=美食', page: '/pages/food/list' }
]
```

### 方案二：使用 emoji
将 icon 字段改为 emoji：
```javascript
functionIcons: [
  { id: 1, name: '非遗', icon: '🏛', page: '/pages/culture/list' },
  { id: 2, name: '文创', icon: '🎨', page: '/pages/culture/list' },
  { id: 3, name: '景区', icon: '🏔', page: '/pages/attractions/list' },
  { id: 4, name: '酒店', icon: '🏨', page: '' },
  { id: 5, name: '民宿', icon: '🏡', page: '' },
  { id: 6, name: '美食', icon: '🍜', page: '/pages/food/list' }
]
```
并修改 index.wxss 中的 .function-icon 样式：
```css
.function-icon {
  width: 88rpx;
  height: 88rpx;
  font-size: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## 图标获取建议

### 免费图标网站
- [Iconfont](https://www.iconfont.cn/) - 阿里巴巴矢量图标库
- [Flaticon](https://www.flaticon.com/) - 免费图标库
- [IconPark](https://iconpark.oceanengine.com/) - 字节跳动图标库

### 图标要求
- 格式：PNG
- 尺寸：建议 88x88px 或以上
- 背景：透明
- 风格：彩色，扁平或拟物风格
- 配色：与整体大漠古韵风格协调

## 放置位置

将准备好的图标文件复制到：
```
宁夏文旅小程序/assets/
├── feiyi.png
├── wenchuang.png
├── jingqu.png
├── jiudian.png
├── minsu.png
└── meishi.png
```
