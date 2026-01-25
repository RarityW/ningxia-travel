// pages/search/index.js
const API = require('../../utils/request')

Page({
    data: {
        navHeight: 0,
        keyword: '',
        currentTab: 'attractions', // attractions or products
        placeholder: '搜索景点...',

        list: [],
        page: 1,
        hasMore: true,
        loading: false,
        searched: false
    },

    onLoad(options) {
        this.initNavHeight()

        // 初始化类型
        if (options.type) {
            this.setData({
                currentTab: options.type,
                placeholder: options.type === 'products' ? '搜索宁夏好物...' : '搜索景点...'
            })
        }

        // 如果有传入关键字，直接搜索
        if (options.keyword) {
            this.setData({ keyword: options.keyword })
            this.onSearch()
        }
    },

    initNavHeight() {
        const sys = wx.getSystemInfoSync()
        this.setData({
            navHeight: (sys.statusBarHeight || 20) + 44
        })
    },

    // 输入监听
    onInput(e) {
        this.setData({ keyword: e.detail.value })
    },

    // 清空
    clearKeyword() {
        this.setData({ keyword: '', list: [], searched: false })
    },

    // 切换Tab
    switchTab(e) {
        const type = e.currentTarget.dataset.type
        if (type === this.data.currentTab) return

        this.setData({
            currentTab: type,
            placeholder: type === 'products' ? '搜索宁夏好物...' : '搜索景点...',
            list: [],
            page: 1,
            hasMore: true,
            searched: false
        })

        // 如果有关键字，自动搜索
        if (this.data.keyword) {
            this.onSearch()
        }
    },

    // 执行搜索
    async onSearch() {
        if (!this.data.keyword.trim()) return

        this.setData({
            list: [],
            page: 1,
            hasMore: true,
            loading: true,
            searched: true
        })

        await this.loadData()
    },

    // 加载更多
    async onLoadMore() {
        if (!this.data.hasMore || this.data.loading) return
        this.setData({ loading: true })
        await this.loadData()
    },

    // 数据请求逻辑
    async loadData() {
        try {
            const { currentTab, keyword, page } = this.data
            let res

            if (currentTab === 'attractions') {
                res = await API.getAttractions({
                    page,
                    page_size: 10,
                    keyword
                })
            } else {
                res = await API.getProducts({
                    page,
                    page_size: 10,
                    keyword // 注：后端API需确认是否支持keyword，若不支持需修改后端
                })
            }

            const newData = res.list || []

            this.setData({
                list: this.data.list.concat(newData),
                page: page + 1,
                hasMore: newData.length === 10,
                loading: false
            })

        } catch (err) {
            console.error('Search failed:', err)
            this.setData({ loading: false })
            wx.showToast({ title: '搜索失败', icon: 'none' })
        }
    },

    // 跳转详情
    goToDetail(e) {
        const { id, type } = e.currentTarget.dataset
        const url = type === 'attraction'
            ? `/pages/attractions/detail?id=${id}`
            : `/pages/market/detail?id=${id}`

        wx.navigateTo({ url })
    }
})
