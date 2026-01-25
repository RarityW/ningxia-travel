// 品牌精选页面 - 宁选好礼分类展示
const API = require('../../utils/request')

Page({
    data: {
        // 分类数据 - 与首页宁选好礼对应
        categories: [
            { id: 1, key: '宁夏枸杞', name: '宁夏枸杞', icon: '🍒' },
            { id: 2, key: '贺兰红酒', name: '贺兰红酒', icon: '🍷' },
            { id: 3, key: '盐池滩羊', name: '盐池滩羊', icon: '🐑' },
            { id: 4, key: '八宝茶', name: '八宝茶', icon: '🍵' },
            { id: 5, key: '非遗文创', name: '非遗文创', icon: '🎨' },
            { id: 6, key: '特色美食', name: '特色美食', icon: '🥘' }
        ],
        currentCategory: '宁夏枸杞',
        currentCategoryName: '宁夏枸杞',
        products: [],
        loading: false,
        page: 1,
        pageSize: 10,
        total: 0,
        hasMore: true
    },

    onLoad(options) {
        // 接收首页传入的分类参数
        const { category } = options
        if (category) {
            const found = this.data.categories.find(c => c.key === category)
            if (found) {
                this.setData({
                    currentCategory: found.key,
                    currentCategoryName: found.name
                })
            }
        }
        this.loadProducts()
    },

    // 切换分类
    switchCategory(e) {
        const key = e.currentTarget.dataset.key
        if (key === this.data.currentCategory) return

        const found = this.data.categories.find(c => c.key === key)
        this.setData({
            currentCategory: key,
            currentCategoryName: found ? found.name : key,
            page: 1,
            hasMore: true,
            products: []
        }, () => {
            this.loadProducts()
        })
    },

    // 加载商品
    async loadProducts() {
        if (this.data.loading) return

        this.setData({ loading: true })

        try {
            const res = await API.getProducts({
                page: this.data.page,
                page_size: this.data.pageSize,
                category: this.data.currentCategory
            })

            const newProducts = this.data.page === 1
                ? res.list
                : this.data.products.concat(res.list)

            this.setData({
                products: newProducts,
                total: res.total,
                hasMore: newProducts.length < res.total,
                loading: false
            })

            if (this.data.hasMore) {
                this.setData({ page: this.data.page + 1 })
            }
        } catch (err) {
            console.error('加载商品失败:', err)
            this.setData({ loading: false })
        }
    },

    // 加载更多
    loadMore() {
        if (this.data.hasMore && !this.data.loading) {
            this.loadProducts()
        }
    },

    // 跳转商品详情
    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/product-detail/product-detail?id=${id}`
        })
    },

    onPullDownRefresh() {
        this.setData({
            page: 1,
            hasMore: true,
            products: []
        }, () => {
            this.loadProducts()
            wx.stopPullDownRefresh()
        })
    },

    // 自定义返回逻辑 - 返回到宁选好礼页面
    handleBack(e) {
        // 阻止事件冒泡，防止custom-nav的默认返回逻辑执行
        if (e) {
            e.stopPropagation && e.stopPropagation();
        }

        // 直接跳转到宁选好礼页
        wx.redirectTo({
            url: '/pages/shop/index',
            fail: () => {
                // 如果redirectTo失败，尝试navigateTo
                wx.navigateTo({
                    url: '/pages/shop/index',
                    fail: () => {
                        // 最后的fallback，返回上一页
                        wx.navigateBack({
                            delta: 1,
                            fail: () => {
                                wx.switchTab({
                                    url: '/pages/index/index'
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    onShareAppMessage() {
        return {
            title: `${this.data.currentCategoryName} - 宁选好礼`,
            path: `/pages/brand/index?category=${this.data.currentCategory}`
        }
    }
})
