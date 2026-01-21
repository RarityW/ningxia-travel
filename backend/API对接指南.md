# 宁夏文旅小程序 - 后端对接指南

## 后端 API 地址

开发环境：`http://localhost:8080`
生产环境：`https://api.ningxia-wenlv.com`

## 小程序端对接

### 1. 配置 API 地址

在小程序的 `app.js` 中配置：

```javascript
// app.js
App({
  onLaunch() {
    // API 基础地址
    this.globalData.apiBaseURL = 'http://localhost:8080/api/v1'
  },
  globalData: {
    apiBaseURL: '',
    token: ''
  }
});
```

### 2. 封装请求函数

在 `utils/request.js` 中创建：

```javascript
// utils/request.js

const getApiUrl = (path) => {
  const app = getApp()
  return app.globalData.apiBaseURL + path
}

const request = (url, method = 'GET', data = {}, needAuth = false) => {
  const app = getApp()
  const header = {
    'Content-Type': 'application/json'
  }

  if (needAuth && app.globalData.token) {
    header['Authorization'] = `Bearer ${app.globalData.token}`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: getApiUrl(url),
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data)
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
            reject(res.data)
          }
        } else {
          reject({ statusCode: res.statusCode, data: res.data })
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET 请求
export const get = (url, data = {}) => {
  return request(url, 'GET', data)
}

// POST 请求
export const post = (url, data = {}, needAuth = false) => {
  return request(url, 'POST', data, needAuth)
}

// PUT 请求
export const put = (url, data = {}) => {
  return request(url, 'PUT', data, true)
}

// DELETE 请求
export const del = (url, data = {}) => {
  return request(url, 'DELETE', data, true)
}
```

### 3. 小程序登录

在 `pages/login/login.js` 中：

```javascript
// pages/login/login.js
import { post } from '../../utils/request.js'

Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.handleLogin()
  },

  async handleLogin() {
    try {
      // 获取用户信息
      const res = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })

      // 获取登录 code
      const loginRes = await wx.login()
      
      // 调用后端登录接口
      const loginData = await post('/auth/login', {
        openid: 'mock_openid_' + Date.now(), // 实际应该调用 wx.login 获取的 code
        nickname: res.userInfo.nickName,
        avatar: res.userInfo.avatarUrl,
        gender: res.userInfo.gender
      })

      // 保存 token 和用户信息
      const app = getApp()
      app.globalData.token = loginData.token
      app.globalData.userId = loginData.user_id
      app.globalData.openid = loginData.openid

      wx.setStorageSync('token', loginData.token)
      wx.setStorageSync('userInfo', loginData)

      // 返回首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      console.error('登录失败', err)
    }
  }
})
```

### 4. 获取景点列表

在 `pages/attractions/list.js` 中：

```javascript
// pages/attractions/list.js
import { get } from '../../utils/request.js'

Page({
  data: {
    attractions: [],
    currentCategory: 'all',
    page: 1,
    pageSize: 10,
    total: 0
  },

  onLoad(options) {
    if (options.category) {
      this.setData({ currentCategory: options.category })
    }
    this.loadAttractions()
  },

  async loadAttractions() {
    try {
      const res = await get('/attractions', {
        page: this.data.page,
        page_size: this.data.pageSize,
        category: this.data.currentCategory
      })

      this.setData({
        attractions: res,
        total: res.total
      })
    } catch (err) {
      console.error('加载景点失败', err)
    }
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category, page: 1 })
    this.loadAttractions()
  }
})
```

### 5. 购物车功能

在 `pages/cart/index.js` 中：

```javascript
// pages/cart/index.js
import { get, post, put, del } from '../../utils/request.js'

Page({
  data: {
    cartItems: []
  },

  onShow() {
    this.loadCart()
  },

  async loadCart() {
    try {
      const res = await get('/user/cart')
      this.setData({ cartItems: res })
    } catch (err) {
      console.error('加载购物车失败', err)
    }
  },

  async addToCart(productId, quantity) {
    try {
      await post('/user/cart', {
        product_id: productId,
        quantity: quantity
      }, true)

      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      })

      this.loadCart()
    } catch (err) {
      console.error('添加购物车失败', err)
    }
  }
})
```

### 6. 创建订单

```javascript
// pages/order/create.js
import { post } from '../../utils/request.js'

Page({
  async createOrder(address, remark) {
    try {
      const order = await post('/user/orders', {
        address: address,
        remark: remark
      }, true)

      wx.showToast({
        title: '订单创建成功',
        icon: 'success'
      })

      // 跳转到订单详情
      wx.navigateTo({
        url: `/pages/order/detail?id=${order.order_id}`
      })
    } catch (err) {
      console.error('创建订单失败', err)
    }
  }
})
```

## 管理系统对接

### 1. 管理员登录

```javascript
// admin/api.js
import { post } from './request.js'

export async function adminLogin(username, password) {
  return post('/auth/admin/login', {
    username,
    password
  })
}
```

### 2. 创建景点

```javascript
// admin/api.js
import { post } from './request.js'

export async function createAttraction(data) {
  return post('/admin/attractions', data, true)
}
```

### 3. 上传文件

```javascript
// admin/api.js
import { post } from './request.js'

export async function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: 'http://localhost:8080/api/v1/admin/upload',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('adminToken')}`
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data.data)
        } else {
          reject(data)
        }
      },
      fail: reject
    })
  })
}
```

## 数据导入工具

为了方便初始化数据，可以创建数据导入脚本：

### 1. 导入景点数据

```bash
# 假设你有一个 JSON 文件包含景点数据
cat attractions.json | jq -r '.[]' | while read -r line; do
  curl -X POST http://localhost:8080/api/v1/admin/attractions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -d "$line"
done
```

### 2. Python 导入脚本示例

```python
# import_data.py
import requests
import json

API_URL = 'http://localhost:8080/api/v1'
ADMIN_TOKEN = 'your_admin_token'

headers = {
    'Authorization': f'Bearer {ADMIN_TOKEN}',
    'Content-Type': 'application/json'
}

def import_attractions(data_file):
    with open(data_file, 'r', encoding='utf-8') as f:
        attractions = json.load(f)
    
    for attraction in attractions:
        response = requests.post(
            f'{API_URL}/admin/attractions',
            json=attraction,
            headers=headers
        )
        
        if response.status_code == 200:
            print(f"成功导入: {attraction['name']}")
        else:
            print(f"导入失败: {attraction['name']} - {response.text}")

if __name__ == '__main__':
    import_attractions('attractions.json')
```

## 开发建议

1. **本地开发**
   - 启动 Go 后端：`go run main.go`
   - 在微信开发者工具中测试 API

2. **调试**
   - 使用 `console.log` 输出请求和响应
   - 检查网络请求是否成功
   - 查看 Go 后端日志

3. **测试流程**
   - 小程序登录 → 获取 token
   - 带着 token 访问需要认证的接口
   - 测试购物车和订单流程

4. **错误处理**
   - 网络错误：提示用户检查网络
   - 认证错误：重新登录
   - 服务器错误：显示友好的错误提示

## 注意事项

1. **HTTPS**
   - 生产环境必须使用 HTTPS
   - 小程序要求 HTTPS 域名

2. **Token 管理**
   - Token 有效期为 24 小时
   - Token 过期后需要重新登录
   - 可以实现 Token 刷新机制

3. **文件上传**
   - 当前版本保存在本地
   - 生产环境建议使用阿里云 OSS 或腾讯云 COS

4. **安全性**
   - 不要在客户端存储敏感信息
   - 使用 HTTPS 传输
   - 验证所有输入参数
   - 实现频率限制
