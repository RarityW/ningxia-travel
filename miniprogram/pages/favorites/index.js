const API = require('../../utils/request')

Page({
  data: {
    activeCategory: 'all',
    categories: [
      { label: '全部', value: 'all' },
      { label: '景点', value: 'attraction' },
      { label: '美食', value: 'food' },
      { label: '文化', value: 'culture' }
    ],
    favorites: [],
    filteredFavorites: [],
    loading: true
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    this.loadFavorites()
  },

  loadFavorites() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
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

    this.setData({ loading: true })

    API.getFavorites()
      .then(favorites => {
        this.setData({
          favorites: favorites,
          filteredFavorites: this.filterByCategory(this.data.activeCategory, favorites),
          loading: false
        })
      })
      .catch(err => {
        console.error('加载收藏失败:', err)
        this.setData({ loading: false })
      })
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      activeCategory: category,
      filteredFavorites: this.filterByCategory(category, this.data.favorites)
    })
  },

  filterByCategory(category, favorites) {
    if (category === 'all') {
      return favorites
    }
    return favorites.filter(item => item.type === category)
  },

  goToDetail(e) {
    const item = e.currentTarget.dataset.item
    const urlMap = {
      attraction: `/pages/attractions/detail?id=${item.attraction_id || item.id}`,
      food: `/pages/food/detail?id=${item.food_id || item.id}`,
      culture: `/pages/culture/detail?id=${item.culture_id || item.id}`
    }

    wx.navigateTo({
      url: urlMap[item.type]
    })
  },

  deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          API.deleteFavorite(id)
            .then(() => {
              this.loadFavorites()
              wx.showToast({
                title: '已取消收藏',
                icon: 'success'
              })
            })
            .catch(err => {
              console.error('取消收藏失败:', err)
            })
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '我的收藏 - 宁夏文旅',
      path: '/pages/favorites/index'
    }
  }
});
