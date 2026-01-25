const app = getApp()

Page({
    data: {
        product: null,
        loading: true
    },

    onLoad(options) {
        if (options.id) {
            this.loadProduct(options.id)
        }
    },

    loadProduct(id) {
        wx.showLoading({ title: '加载中' })
        wx.request({
            url: `${app.globalData.baseUrl}/market/${id}`,
            success: (res) => {
                if (res.data.code === 200) {
                    const product = res.data.data
                    // Ensure merchant info is present (backend should return it, if not fetching via separate API might be needed, 
                    // but ideally product detail API includes merchant basic info)
                    // For now assuming backend returns merchant_id, we might need to fetch merchant details if not included.
                    // Let's assume we need to fetch merchant details separately if not embedded.
                    // Actually, let's fetch merchant details if we have merchant_id
                    this.setData({ product })
                    if (product.merchant_id) {
                        this.loadMerchant(product.merchant_id)
                    }
                }
            },
            complete: () => {
                wx.hideLoading()
                this.setData({ loading: false })
            }
        })
    },

    loadMerchant(id) {
        wx.request({
            url: `${app.globalData.baseUrl}/merchants/${id}`,
            success: (res) => {
                if (res.data.code === 200) {
                    this.setData({
                        ['product.merchant']: res.data.data
                    })
                }
            }
        })
    },

    goToShop() {
        if (this.data.product && this.data.product.merchant_id) {
            wx.navigateTo({
                url: `/pages/shop-detail/shop-detail?id=${this.data.product.merchant_id}`
            })
        }
    },

    addToCart() {
        // Implement add to cart logic
        wx.showToast({ title: '已加入购物车', icon: 'success' })
    },

    buyNow() {
        wx.showToast({ title: '正在创建订单...', icon: 'loading' })
    }
})
