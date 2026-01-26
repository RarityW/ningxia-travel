const app = getApp()
const API = require('../../utils/request')

Page({
    data: {
        product: null,
        loading: true
    },

    onLoad(options) {
        if (options.id) {
            this.loadProduct(options.id)
        } else {
            this.setData({ loading: false })
        }
    },

    async loadProduct(id) {
        this.setData({ loading: true })

        try {
            let product = await API.getProduct(id)

            // Parse JSON strings for images
            if (typeof product.images === 'string') {
                try {
                    product.images = JSON.parse(product.images);
                } catch (e) { product.images = []; }
            }
            // Parse JSON strings for detailImages (camelCase from API)
            if (typeof product.detailImages === 'string') {
                try {
                    product.detailImages = JSON.parse(product.detailImages);
                } catch (e) { product.detailImages = []; }
            }

            this.setData({ product, loading: false })

            wx.setNavigationBarTitle({
                title: product.name || '商品详情'
            })

            // 如果有商家ID，加载商家信息
            if (product.merchantId) {
                this.loadMerchant(product.merchantId)
            }
        } catch (err) {
            console.error('加载商品失败:', err)
            this.setData({ loading: false })
        }
    },

    async loadMerchant(id) {
        try {
            const api = require('../../utils/api')
            const res = await new Promise((resolve, reject) => {
                wx.request({
                    url: `${api.config.baseURL}${api.config.apiVersion}/merchants/${id}`,
                    success: (res) => {
                        if (res.data.code === 200) {
                            resolve(api.toCamelCase(res.data.data))
                        } else {
                            reject(res.data)
                        }
                    },
                    fail: reject
                })
            })
            this.setData({
                ['product.merchant']: res
            })
        } catch (err) {
            console.error('加载商家失败:', err)
        }
    },

    goBack() {
        wx.navigateBack({
            fail: () => {
                wx.switchTab({ url: '/pages/index/index' })
            }
        })
    },

    goToShop() {
        if (this.data.product && this.data.product.merchantId) {
            wx.navigateTo({
                url: `/pages/shop-detail/shop-detail?id=${this.data.product.merchantId}`
            })
        } else {
            wx.showToast({ title: '店铺信息加载中', icon: 'none' })
        }
    },

    goToCart() {
        wx.navigateTo({
            url: '/pages/cart/index'
        })
    },

    addToCart() {
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

        API.addToCart({
            product_id: this.data.product.id,
            quantity: 1
        }).then(() => {
            wx.showToast({ title: '已加入购物车', icon: 'success' })
        }).catch(() => {
            wx.showToast({ title: '添加失败', icon: 'none' })
        })
    },

    buyNow() {
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

        const product = this.data.product
        wx.showModal({
            title: '确认购买',
            content: `确定购买 1 件【${product.name}】吗？\n\n总价：¥${product.price}`,
            confirmText: '立即支付',
            confirmColor: '#FF4400',
            success: (res) => {
                if (res.confirm) {
                    wx.showToast({ title: '下单成功', icon: 'success' })
                }
            }
        })
    },

    previewImage(e) {
        const current = e.currentTarget.dataset.current;
        const urls = e.currentTarget.dataset.urls;
        wx.previewImage({
            current: current,
            urls: urls
        })
    },

    previewDetailImage(e) {
        const current = e.currentTarget.dataset.current;
        const urls = e.currentTarget.dataset.urls;
        wx.previewImage({
            current: current,
            urls: urls
        })
    },

    onShareAppMessage() {
        const { product } = this.data
        return {
            title: product ? product.name + ' - 宁夏文旅' : '宁夏好物',
            path: '/pages/product-detail/product-detail?id=' + (product ? product.id : '')
        }
    }
})
