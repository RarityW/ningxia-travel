const API = require('../../utils/request')

Page({
  data: {
    culture: null,
    isFavorite: false,
    id: ''
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadCultureDetail(id)
    }
  },

  onShareAppMessage() {
    const { culture } = this.data
    return {
      title: culture ? culture.name : '宁夏文化',
      path: `/pages/culture/detail?id=${this.data.id}`
    }
  },

  loadCultureDetail(id) {
    wx.showLoading({ title: '加载中...' })

    API.getCulture(id)
      .then(data => {
        this.setData({ culture: data })
        wx.setNavigationBarTitle({
          title: data.name
        })
      })
      .catch(err => {
        console.error('加载文化详情失败:', err)
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },

  checkFavorite(id) {
    const app = getApp()
    if (!app.globalData.token) {
      this.setData({ isFavorite: false })
      return
    }

    API.getFavorites()
      .then(favorites => {
        const isFavorite = favorites.some(item => item.culture_id == id)
        this.setData({ isFavorite })
      })
      .catch(err => {
        console.error('检查收藏失败:', err)
      })
  },

  toggleFavorite() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
      return
    }

    const { id, isFavorite } = this.data

    if (isFavorite) {
      API.deleteFavorite(id)
        .then(() => {
          this.setData({ isFavorite: false })
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
        })
        .catch(err => {
          console.error('取消收藏失败:', err)
        })
    } else {
      API.addFavorite({
        culture_id: id,
        type: 'culture'
      })
        .then(() => {
          this.setData({ isFavorite: true })
          wx.showToast({
            title: '收藏成功',
            icon: 'success'
          })
        })
        .catch(err => {
          console.error('添加收藏失败:', err)
        })
    }
  }
});
