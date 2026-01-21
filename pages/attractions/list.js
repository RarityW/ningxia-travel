const API = require('../../utils/request')

Page({
  data: {
    categories: ['全部', '5A', '4A', '自然', '历史', '文化', '沙漠', '草原'],
    currentCategory: '全部',
    attractions: [],
    loading: false,
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true
  },

  onLoad() {
    this.loadAttractions()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadAttractions()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      attractions: []
    }, () => {
      this.loadAttractions()
      wx.stopPullDownRefresh()
    })
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    if (category === this.data.currentCategory) return

    this.setData({
      currentCategory: category,
      page: 1,
      hasMore: true,
      attractions: []
    }, () => {
      this.loadAttractions()
    })
  },

  loadAttractions() {
    if (this.data.loading) return

    this.setData({ loading: true })

    const params = {
      page: this.data.page,
      page_size: this.data.pageSize,
      category: this.data.currentCategory
    }

    API.getAttractions(params)
      .then(data => {
        const newAttractions = this.data.page === 1
          ? data.list
          : this.data.attractions.concat(data.list)

        this.setData({
          attractions: newAttractions,
          total: data.total,
          hasMore: this.data.attractions.length + data.list.length < data.total,
          loading: false
        })

        if (this.data.hasMore) {
          this.setData({ page: this.data.page + 1 })
        }
      })
      .catch(err => {
        console.error('加载景点列表失败:', err)
        this.setData({ loading: false })
      })
  },

  onShareAppMessage() {
    const attraction = this.data.attractions[0]
    return {
      title: attraction ? attraction.name : '宁夏景点',
      path: '/pages/attractions/list'
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/attractions/detail?id=${id}`
    })
  },

  goToAttractions() {
    wx.switchTab({
      url: '/pages/attractions/list'
    })
  }
});
