const API = require('../../utils/request')

Page({
    data: {
        navHeight: 0,
        keyword: '',
        currentTab: 'all', // all, attractions, products
        placeholder: '搜索...',

        list: [], // For single tab pagination
        allData: { // For combined view
            attractions: [],
            products: [],
            food: [],
            culture: []
        },
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
                placeholder: this.getPlaceholder(options.type)
            })
        }

        // 如果有传入关键字，直接搜索
        if (options.keyword) {
            this.setData({ keyword: options.keyword })
            this.onSearch()
        }
    },

    getPlaceholder(type) {
        switch (type) {
            case 'products': return '搜索宁夏好物...';
            case 'attractions': return '搜索景点...';
            default: return '搜索景点、美食、特产...';
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
        this.setData({
            keyword: '',
            list: [],
            allData: { attractions: [], products: [], food: [], culture: [] },
            searched: false
        })
    },

    // 切换Tab
    switchTab(e) {
        const type = e.currentTarget.dataset.type
        if (type === this.data.currentTab) return

        this.setData({
            currentTab: type,
            placeholder: this.getPlaceholder(type),
            list: [],
            allData: { attractions: [], products: [], food: [], culture: [] },
            page: 1,
            hasMore: true,
            searched: false,
            loading: false
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
            allData: { attractions: [], products: [], food: [], culture: [] },
            page: 1,
            hasMore: true,
            loading: true,
            searched: true
        })

        await this.loadData()
    },

    // 加载更多
    async onLoadMore() {
        if (this.data.currentTab === 'all') return // Combined view has no pagination
        if (!this.data.hasMore || this.data.loading) return
        this.setData({ loading: true })
        await this.loadData()
    },

    // 数据请求逻辑
    async loadData() {
        try {
            const { currentTab, keyword, page } = this.data

            if (currentTab === 'all') {
                const res = await API.search(keyword)
                this.setData({
                    allData: res || { attractions: [], products: [], food: [], culture: [] },
                    loading: false
                })
            } else {
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
                        keyword
                    })
                }

                const newData = res.list || []
                this.setData({
                    list: this.data.list.concat(newData),
                    page: page + 1,
                    hasMore: newData.length === 10,
                    loading: false
                })
            }

        } catch (err) {
            console.error('Search failed:', err)
            this.setData({ loading: false })
            wx.showToast({ title: '搜索失败', icon: 'none' })
        }
    },

    // 跳转详情
    goToDetail(e) {
        const { id, type } = e.currentTarget.dataset
        let url = ''

        switch (type) {
            case 'attraction':
                url = `/pages/attractions/detail?id=${id}`
                break
            case 'product':
                url = `/pages/product-detail/product-detail?id=${id}` // Note: Check correct path for product detail
                break
            case 'food':
                url = `/pages/food/detail?id=${id}`
                break
            case 'culture':
                url = `/pages/culture/detail?id=${id}`
                break
        }

        if (url) wx.navigateTo({ url })
    }
})
