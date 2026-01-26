const app = getApp()

Page({
    data: {
        merchant: null,
        products: [],
        loading: true,
        page: 1,
        pageSize: 10,
        hasMore: true,
        currentTab: 0, // 0: 全部商品, 1: 热销推荐
        isFollowed: false,
        merchantId: null
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ merchantId: options.id })
            this.loadMerchant(options.id)
            this.loadProducts(options.id, 1)
            this.checkFollowStatus(options.id)
        }
    },

    // 加载商家信息
    loadMerchant(id) {
        wx.request({
            url: `${app.globalData.baseUrl}/merchants/${id}`,
            success: (res) => {
                if (res.data.code === 200) {
                    this.setData({ merchant: res.data.data })
                    wx.setNavigationBarTitle({ title: res.data.data.name || '店铺详情' })
                } else {
                    wx.showToast({ title: '店铺不存在', icon: 'none' })
                }
            },
            fail: () => {
                wx.showToast({ title: '加载失败', icon: 'none' })
            }
        })
    },

    // 加载商品列表
    loadProducts(id, page) {
        if (this.data.loading && page > 1) return

        this.setData({ loading: true })

        const params = `page=${page}&page_size=${this.data.pageSize}`
        const hotParam = this.data.currentTab === 1 ? '&is_hot=1' : ''

        wx.request({
            url: `${app.globalData.baseUrl}/merchants/${id}/products?${params}${hotParam}`,
            success: (res) => {
                if (res.data.code === 200) {
                    const newProducts = res.data.data || []
                    this.setData({
                        products: page === 1 ? newProducts : [...this.data.products, ...newProducts],
                        hasMore: newProducts.length >= this.data.pageSize,
                        page: page
                    })
                }
            },
            complete: () => {
                this.setData({ loading: false })
            }
        })
    },

    // 检查关注状态
    checkFollowStatus(merchantId) {
        const token = app.globalData.token
        if (!token) return

        wx.request({
            url: `${app.globalData.baseUrl}/user/favorites`,
            header: { 'Authorization': `Bearer ${token}` },
            success: (res) => {
                if (res.data.code === 200) {
                    const favorites = res.data.data || []
                    const isFollowed = favorites.some(f => f.type === 'merchant' && f.target_id == merchantId)
                    this.setData({ isFollowed })
                }
            }
        })
    },

    // 切换关注
    toggleFollow() {
        const token = app.globalData.token
        if (!token) {
            wx.showModal({
                title: '提示',
                content: '请先登录后操作',
                success: (res) => {
                    if (res.confirm) {
                        wx.switchTab({ url: '/pages/profile/profile' })
                    }
                }
            })
            return
        }

        const { isFollowed, merchantId } = this.data

        if (isFollowed) {
            // 取消关注
            wx.request({
                url: `${app.globalData.baseUrl}/user/favorites/${merchantId}`,
                method: 'DELETE',
                header: { 'Authorization': `Bearer ${token}` },
                success: (res) => {
                    if (res.data.code === 200) {
                        this.setData({ isFollowed: false })
                        wx.showToast({ title: '已取消关注', icon: 'none' })
                    }
                }
            })
        } else {
            // 添加关注
            wx.request({
                url: `${app.globalData.baseUrl}/user/favorites`,
                method: 'POST',
                header: { 'Authorization': `Bearer ${token}` },
                data: {
                    type: 'merchant',
                    target_id: parseInt(merchantId)
                },
                success: (res) => {
                    if (res.data.code === 200) {
                        this.setData({ isFollowed: true })
                        wx.showToast({ title: '关注成功', icon: 'success' })
                    }
                }
            })
        }
    },

    // 切换Tab
    switchTab(e) {
        const index = parseInt(e.currentTarget.dataset.index)
        if (index === this.data.currentTab) return

        this.setData({
            currentTab: index,
            page: 1,
            products: [],
            hasMore: true
        })
        this.loadProducts(this.data.merchantId, 1)
    },

    // 加载更多
    onReachBottom() {
        if (this.data.hasMore && !this.data.loading) {
            this.loadProducts(this.data.merchantId, this.data.page + 1)
        }
    },

    // 下拉刷新
    onPullDownRefresh() {
        this.setData({ page: 1, products: [], hasMore: true })
        this.loadMerchant(this.data.merchantId)
        this.loadProducts(this.data.merchantId, 1)
        wx.stopPullDownRefresh()
    },

    // 跳转商品详情
    goToProduct(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/product-detail/product-detail?id=${id}`
        })
    },

    // 复制地址
    copyAddress() {
        if (this.data.merchant && this.data.merchant.address) {
            wx.setClipboardData({
                data: this.data.merchant.address,
                success: () => {
                    wx.showToast({ title: '地址已复制', icon: 'success' })
                }
            })
        }
    },

    // 拨打电话
    callPhone() {
        if (this.data.merchant && this.data.merchant.phone) {
            wx.makePhoneCall({
                phoneNumber: this.data.merchant.phone
            })
        }
    },

    onShareAppMessage() {
        const { merchant } = this.data
        return {
            title: merchant ? `${merchant.name} - 宁夏文旅` : '好店推荐',
            path: `/pages/shop-detail/shop-detail?id=${this.data.merchantId}`
        }
    }
})
