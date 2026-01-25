const app = getApp()

Page({
    data: {
        merchant: null,
        products: [],
        loading: true,
        page: 1,
        hasMore: true
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ merchantId: options.id })
            this.loadMerchant(options.id)
            this.loadProducts(options.id, 1)
        }
    },

    loadMerchant(id) {
        wx.request({
            url: `${app.globalData.baseUrl}/merchants/${id}`,
            success: (res) => {
                if (res.data.code === 200) {
                    this.setData({ merchant: res.data.data })
                    wx.setNavigationBarTitle({ title: res.data.data.name })
                }
            }
        })
    },

    loadProducts(id, page) {
        wx.request({
            url: `${app.globalData.baseUrl}/merchants/${id}/products?page=${page}`,
            success: (res) => {
                if (res.data.code === 200) {
                    const newProducts = res.data.data.list || []
                    this.setData({
                        products: page === 1 ? newProducts : [...this.data.products, ...newProducts],
                        hasMore: newProducts.length >= 10,
                        page: page,
                        loading: false
                    })
                }
            },
            fail: () => {
                this.setData({ loading: false })
            }
        })
    },

    onReachBottom() {
        if (this.data.hasMore) {
            this.loadProducts(this.data.merchantId, this.data.page + 1)
        }
    },

    goToProduct(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/product-detail/product-detail?id=${id}`
        })
    }
})
