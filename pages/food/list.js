const API = require('../../utils/request')

Page({
  data: {
    categories: ['全部', '主食', '小吃', '特色菜', '饮品'],
    currentCategory: '全部',
    foods: [],
    loading: false,
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true
  },

  onLoad() {
    this.loadFoods()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadFoods()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      foods: []
    }, () => {
      this.loadFoods()
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
      foods: []
    }, () => {
      this.loadFoods()
    })
  },

  loadFoods() {
    if (this.data.loading) return

    this.setData({ loading: true })

    const params = {
      page: this.data.page,
      page_size: this.data.pageSize,
      category: this.data.currentCategory
    }

    API.getFoods(params)
      .then(data => {
        const newFoods = this.data.page === 1
          ? data.list
          : this.data.foods.concat(data.list)

        this.setData({
          foods: newFoods,
          total: data.total,
          hasMore: this.data.foods.length + data.list.length < data.total,
          loading: false
        })

        if (this.data.hasMore) {
          this.setData({ page: this.data.page + 1 })
        }
      })
      .catch(err => {
        console.error('加载美食列表失败:', err)
        this.setData({ loading: false })
      })
  },

  onShareAppMessage() {
    const food = this.data.foods[0]
    return {
      title: food ? food.name : '宁夏美食',
      path: '/pages/food/list'
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/food/detail?id=${id}`
    })
  },

  goToFoods() {
    wx.switchTab({
      url: '/pages/food/list'
    })
  }
});
