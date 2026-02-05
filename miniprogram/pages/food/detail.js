const API = require('../../utils/request')

Page({
  data: {
    food: null,
    isFavorite: false,
    id: ''
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadFoodDetail(id)
    }
  },

  onShareAppMessage() {
    const { food } = this.data
    return {
      title: food ? food.name : '宁夏美食',
      path: `/pages/food/detail?id=${this.data.id}`
    }
  },

  loadFoodDetail(id) {
    wx.showLoading({ title: '加载中...' })

    API.getFood(id)
      .then(data => {
        const baseUrl = 'http://127.0.0.1:8080';
        if (data.coverImage && !data.coverImage.startsWith('http')) {
          data.coverImage = baseUrl + data.coverImage;
        }
        if (data.images && Array.isArray(data.images)) {
          data.images = data.images.map(img => img.startsWith('http') ? img : baseUrl + img);
        } else if (data.images && typeof data.images === 'string') {
          // 尝试解析JSON字符串
          try {
            const imgs = JSON.parse(data.images);
            data.images = imgs.map(img => img.startsWith('http') ? img : baseUrl + img);
          } catch (e) { }
        }
        this.setData({ food: data })
        wx.setNavigationBarTitle({
          title: data.name
        })

        // 记录浏览历史
        API.addHistory({
          target_id: data.id,
          target_type: 'food',
          title: data.name,
          image: data.coverImage || (data.images && data.images.length > 0 ? data.images[0] : ''),
          price: data.price || 0 // Food might not have price or it might be different field, assuming 0 if not present
        })
      })
      .catch(err => {
        console.error('加载美食详情失败:', err)
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
        const isFavorite = favorites.some(item => item.food_id == id)
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
        food_id: id,
        type: 'food'
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
  },

  showShops() {
    const { food } = this.data
    if (food && food.shops) {
      let shops = []
      try {
        shops = JSON.parse(food.shops)
      } catch (e) {
        shops = []
      }

      if (shops.length > 0) {
        wx.showModal({
          title: '推荐商家',
          content: shops.join('\n'),
          showCancel: false
        })
      } else {
        wx.showToast({
          title: '暂无推荐商家',
          icon: 'none'
        })
      }
    } else {
      wx.showToast({
        title: '暂无推荐商家',
        icon: 'none'
      })
    }
  }
});
