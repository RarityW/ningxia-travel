const API = require('../../utils/request')

Page({
  data: {
    userInfo: {},
    hasLogin: false,
    favoriteCount: 0,
    cartCount: 0,
    orderCount: 0,
    phone: '',
    password: '',
    nickname: '',
    authMode: 'login', // 'login' or 'register'
    loading: false,
  },

  // Lifecycle
  onLoad() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  onShow() {
    // Ensure login form is shown by default
    this.setData({ authMode: 'login' })
    this.loadUserStats()
  },

  // Load user info from global data / storage
  loadUserInfo() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasLogin: true,
      })
    } else {
      this.setData({
        userInfo: {},
        hasLogin: false,
      })
    }
  },

  // Mock stats (replace with real API later)
  // Load real stats from API
  async loadUserStats() {
    if (!this.data.hasLogin) {
      this.setData({
        favoriteCount: 0,
        cartCount: 0,
        orderCount: 0,
      })
      return
    }

    try {
      const [favorites, cart, orders] = await Promise.all([
        API.getFavorites().catch(() => []),
        API.getCart().catch(() => []),
        API.getOrders({ page: 1, limit: 1 }).catch(() => ({ list: [], total: 0 })), // Orders might return pagination object
      ])

      this.setData({
        favoriteCount: Array.isArray(favorites) ? favorites.length : 0,
        cartCount: Array.isArray(cart) ? cart.length : 0,
        orderCount: orders.total || (Array.isArray(orders) ? orders.length : 0),
      })
    } catch (err) {
      console.error('Failed to load user stats:', err)
    }
  },

  // Switch between login and register mode
  switchMode(e) {
    const newMode = this.data.authMode === 'login' ? 'register' : 'login'
    this.setData({
      authMode: newMode,
      phone: '',
      password: '',
      nickname: '',
    })
  },

  // Execute login using backend API
  async executeLogin(e) {
    if (this.data.loading) return
    const { phone, password } = this.data
    if (!phone || !password) {
      wx.showToast({ title: '请填写手机号和密码', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      const res = await API.userLogin({ phone, password })
      this.handleAuthSuccess(res)
    } catch (err) {
      console.error('登录失败:', err)
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // Execute registration using backend API
  async executeRegister(e) {
    if (this.data.loading) return
    const { phone, password, nickname } = this.data
    if (!phone || !password || !nickname) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      const res = await API.userRegister({ phone, password, nickname })
      this.handleAuthSuccess(res)
    } catch (err) {
      console.error('注册失败:', err)
      wx.showToast({ title: err.message || '注册失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // Common success handling for both login and register
  handleAuthSuccess(data) {
    const { token, userInfo } = data
    const app = getApp()
    // Store token and user info globally and in storage
    wx.setStorageSync('token', token)
    wx.setStorageSync('userInfo', userInfo)
    app.globalData.token = token
    app.globalData.userInfo = userInfo
    this.setData({
      userInfo,
      hasLogin: true,
      phone: '',
      password: '',
      nickname: '',
    })
    this.loadUserStats()
    wx.showToast({ title: '登录成功', icon: 'success' })
  },

  // Logout
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
            orderCount: 0,
          })
          wx.showToast({ title: '已退出登录', icon: 'success' })
        }
      },
    })
  },

  // Navigation helpers (require login)
  goToFavorites() {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/favorites/index' })
  },

  goToCart() {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/cart/index' })
  },

  goToOrders() {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/order/list/index' })
  },

  goToCoupons() {
    if (!this.checkLogin()) return
    wx.showToast({ title: '优惠券功能开发中', icon: 'none' })
  },

  goToSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  goToAbout() {
    wx.showModal({
      title: '关于宁夏文旅',
      content: '宁夏文旅小程序，发现宁夏之美，体验宁夏风情。版本：v1.0.0',
      showCancel: false,
    })
  },

  // 跳转编辑资料
  goToEditProfile() {
    wx.navigateTo({
      url: '/pages/profile/edit/edit'
    })
  },

  // 跳转浏览历史
  goToHistory() {
    wx.navigateTo({
      url: '/pages/profile/history/history'
    })
  },

  contactSupport() {
    wx.showActionSheet({
      itemList: ['拨打客服热线', '在线客服'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: '12345678' })
        } else {
          wx.showToast({ title: '在线客服功能开发中', icon: 'none' })
        }
      }
    })
  },

  // Ensure user is logged in before protected actions
  checkLogin() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            this.setData({ authMode: 'login' })
          }
        },
      })
      return false
    }
    return true
  },

  // Share
  onShareAppMessage() {
    return {
      title: '宁夏文旅 - 发现宁夏之美',
      path: '/pages/index/index',
    }
  },
})
