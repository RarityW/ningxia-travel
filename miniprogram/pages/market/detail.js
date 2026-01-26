const app = getApp()

Page({
  data: {
    product: null,
    id: '',
    loading: true
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadProduct(id)
    }
  },

  // 从后端加载商品数据
  loadProduct(id) {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中' })

    wx.request({
      url: `${app.globalData.baseUrl}/market/${id}`,
      success: (res) => {
        if (res.data.code === 200) {
          const product = res.data.data

          // Parse images JSON string to array
          if (typeof product.images === 'string') {
            try {
              product.images = JSON.parse(product.images)
            } catch (e) {
              product.images = []
            }
          }
          // Fallback to cover_image if images is empty
          if (!product.images || product.images.length === 0) {
            product.images = product.cover_image ? [product.cover_image] : []
          }

          // Parse detail_images if present
          if (typeof product.detail_images === 'string') {
            try {
              product.detail_images = JSON.parse(product.detail_images)
            } catch (e) {
              product.detail_images = []
            }
          }

          this.setData({ product })

          wx.setNavigationBarTitle({
            title: product.name || '商品详情'
          })

          // 如果有商家ID，加载商家信息
          if (product.merchant_id) {
            this.loadMerchant(product.merchant_id)
          }
        } else {
          wx.showToast({ title: '商品不存在', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({ loading: false })
      }
    })
  },

  // 加载商家信息
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

  goBack() {
    wx.navigateBack()
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服热线：400-123-4567\n服务时间：8:00-20:00',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#8B4513'
    })
  },

  // 跳转店铺详情页
  goToShop() {
    if (this.data.product && this.data.product.merchant_id) {
      wx.navigateTo({
        url: `/pages/shop-detail/shop-detail?id=${this.data.product.merchant_id}`
      })
    } else {
      wx.showToast({ title: '店铺信息加载中', icon: 'none' })
    }
  },

  // 跳转购物车
  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/index'
    })
  },

  // 加入购物车
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

    wx.request({
      url: `${app.globalData.baseUrl}/user/cart`,
      method: 'POST',
      header: { 'Authorization': `Bearer ${token}` },
      data: {
        product_id: this.data.product.id,
        quantity: 1
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({ title: '已加入购物车', icon: 'success' })
        } else {
          wx.showToast({ title: res.data.message || '添加失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 立即购买
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
          // 创建订单
          wx.request({
            url: `${app.globalData.baseUrl}/user/orders`,
            method: 'POST',
            header: { 'Authorization': `Bearer ${token}` },
            data: {
              items: [{ product_id: product.id, quantity: 1 }]
            },
            success: (orderRes) => {
              if (orderRes.data.code === 200) {
                wx.showToast({ title: '下单成功', icon: 'success' })
              } else {
                wx.showToast({ title: orderRes.data.message || '下单失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  onShareAppMessage() {
    const { product } = this.data
    return {
      title: product ? product.name + ' - 宁夏文旅' : '宁夏好物',
      path: '/pages/market/detail?id=' + this.data.id
    }
  }
})
