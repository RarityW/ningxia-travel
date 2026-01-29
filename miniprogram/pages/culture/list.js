const API = require('../../utils/request')

Page({
  data: {
    categories: ['全部', '非遗', '工艺品', '民俗', '书画'],
    currentCategory: '全部',
    cultures: [],
    loading: false,
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true
  },

  onLoad() {
    this.loadCultures()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCultures()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      cultures: []
    }, () => {
      this.loadCultures()
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
      cultures: []
    }, () => {
      this.loadCultures()
    })
  },

  loadCultures() {
    if (this.data.loading) return

    this.setData({ loading: true })

    const params = {
      page: this.data.page,
      page_size: this.data.pageSize,
      category: this.data.currentCategory === '全部' ? 'all' : this.data.currentCategory
    }

    API.getCultures(params)
      .then(data => {
        const newCultures = this.data.page === 1
          ? data.list
          : this.data.cultures.concat(data.list)

        this.setData({
          cultures: newCultures,
          total: data.total,
          hasMore: this.data.cultures.length + data.list.length < data.total,
          loading: false
        })

        if (this.data.hasMore) {
          this.setData({ page: this.data.page + 1 })
        }
      })
      .catch(err => {
        console.error('加载文化列表失败:', err)
        this.setData({ loading: false })
      })
  },

  onShareAppMessage() {
    const culture = this.data.cultures[0]
    return {
      title: culture ? culture.name : '宁夏文化',
      path: '/pages/culture/list'
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/culture/detail?id=${id}`
    })
  },

  goToCultures() {
    wx.switchTab({
      url: '/pages/culture/list'
    })
  }
});
