const API = require('../../utils/request')

Page({
  data: {
    attraction: null,
    isFavorite: false,
    id: ''
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadAttractionDetail(id)
    }
  },

  onShareAppMessage() {
    const { attraction } = this.data
    return {
      title: attraction ? attraction.name : '宁夏景点',
      path: `/pages/attractions/detail?id=${this.data.id}`
    }
  },

  loadAttractionDetail(id) {
    wx.showLoading({ title: '加载中...' })

    API.getAttraction(id)
      .then(data => {
        const baseUrl = 'http://127.0.0.1:8080';
        // 处理图片URL
        if (data.imageUrl && !data.imageUrl.startsWith('http')) {
          data.imageUrl = baseUrl + data.imageUrl;
        }
        if (data.coverImage && !data.coverImage.startsWith('http')) {
          data.coverImage = baseUrl + data.coverImage;
        }
        // 处理轮播图数组 if present
        if (data.images && Array.isArray(data.images)) {
          data.images = data.images.map(img => img.startsWith('http') ? img : baseUrl + img);
        }

        this.setData({ attraction: data })
        wx.setNavigationBarTitle({
          title: data.name
        })

        // 记录浏览历史
        API.addHistory({
          target_id: data.id,
          target_type: 'attraction',
          title: data.name,
          image: data.coverImage || (data.images && data.images.length > 0 ? data.images[0] : ''),
          price: data.ticket_price || 0
        })
      })
      .catch(err => {
        console.error('加载景点详情失败:', err)
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
        const isFavorite = favorites.some(item => item.attraction_id == id)
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
        attraction_id: id,
        type: 'attraction'
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

  buyTicket() {
    wx.showModal({
      title: '购票提示',
      content: '购票功能开发中，敬请期待',
      showCancel: false
    })
  },

  navigateTo() {
    const { attraction } = this.data
    if (attraction && attraction.latitude && attraction.longitude) {
      wx.openLocation({
        latitude: attraction.latitude,
        longitude: attraction.longitude,
        name: attraction.name,
        address: attraction.address
      })
    } else {
      wx.showToast({
        title: '位置信息不完整',
        icon: 'none'
      })
    }
  },

  callPhone() {
    const { attraction } = this.data
    if (attraction && attraction.phone) {
      wx.makePhoneCall({
        phoneNumber: attraction.phone
      })
    } else {
      wx.showToast({
        title: '暂无联系电话',
        icon: 'none'
      })
    }
  }
});
