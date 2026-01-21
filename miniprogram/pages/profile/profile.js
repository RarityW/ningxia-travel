const API = require('../../utils/request')

Page({
  data: {
    userInfo: {},
    hasLogin: false,
    favoriteCount: 0,
    cartCount: 0,
    orderCount: 0
  },

  onLoad() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  onShow() {
    this.loadUserStats()
  },

  loadUserInfo() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasLogin: true
      })
    } else {
      this.setData({
        userInfo: {},
        hasLogin: false
      })
    }
  },

  loadUserStats() {
    const app = getApp()
    if (!app.globalData.token) return

    Promise.all([
      API.getFavorites(),
      API.getCart(),
      API.getOrders()
    ])
      .then(([favorites, cart, orders]) => {
        this.setData({
          favoriteCount: favorites.length,
          cartCount: cart.length,
          orderCount: orders.list ? orders.list.length : orders.length
        })
      })
      .catch(err => {
        console.error('加载用户统计失败:', err)
      })
  },

  async login() {
    if (this.data.hasLogin) return

    try {
      const app = getApp()
      
      // 使用测试token（用户已存在于数据库中）
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJvcGVuaWQiOiJ0ZXN0X3VzZXJfc2ltcGxlIiwiZXhwIjoxNzY4OTI2OTkxLCJpYXQiOjE3Njg4NDA1OTEsInN1YiI6InVzZXIifQ.0NNzAe2cA_g7mj3api3nwR7kmfVM0_jZ1A5mHQ7UuxA'
      const testUserInfo = {
        avatar: 'https://via.placeholder.com/200x200/F5EDE4/8B7355?text=用户',
        nickname: '简单测试用户',
        openid: 'test_user_simple',
        user_id: 2
      }
      
      wx.setStorageSync('token', testToken)
      wx.setStorageSync('userInfo', testUserInfo)
      
      app.globalData.token = testToken
      app.globalData.userInfo = testUserInfo
      
      this.setData({
        userInfo: testUserInfo,
        hasLogin: true
      })
      
      this.loadUserStats()
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
    } catch (err) {
      console.error('登录失败:', err)
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          
          app.globalData.token = null
          app.globalData.userInfo = null
          
          this.setData({
            userInfo: {},
            hasLogin: false,
            favoriteCount: 0,
            cartCount: 0,
            orderCount: 0
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  goToFavorites() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/favorites/index'
    })
  },

  goToCart() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/cart/index'
    })
  },

  goToOrders() {
    if (!this.checkLogin()) return
    wx.showToast({
      title: '订单功能开发中',
      icon: 'none'
    })
  },

  goToCoupons() {
    if (!this.checkLogin()) return
    wx.showToast({
      title: '优惠券功能开发中',
      icon: 'none'
    })
  },

  goToSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  goToAbout() {
    wx.showModal({
      title: '关于宁夏文旅',
      content: '宁夏文旅小程序，发现宁夏之美，体验宁夏风情。版本：v1.0.0',
      showCancel: false
    })
  },

  checkLogin() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            this.login()
          }
        }
      })
      return false
    }
    return true
  },

  onShareAppMessage() {
    return {
      title: '宁夏文旅 - 发现宁夏之美',
      path: '/pages/index/index'
    }
  }
});
