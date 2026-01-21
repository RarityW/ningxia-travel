const API = require('../../utils/request')

Page({
  data: {
    cartItems: [],
    allSelected: false,
    selectedCount: 0,
    totalPrice: 0,
    loading: true
  },

  onLoad() {
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  loadCart() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/profile'
            })
          }
        }
      })
      return
    }

    this.setData({ loading: true })

    API.getCart()
      .then(cartItems => {
        this.setData({
          cartItems: cartItems,
          loading: false
        })
        this.calculate()
      })
      .catch(err => {
        console.error('加载购物车失败:', err)
        this.setData({ loading: false })
      })
  },

  checkAllSelected(cartItems) {
    return cartItems.length > 0 && cartItems.every(item => item.selected)
  },

  countSelected(cartItems) {
    return cartItems.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0)
  },

  calculate() {
    const { cartItems } = this.data
    const selectedItems = cartItems.filter(item => item.selected)
    
    this.setData({
      allSelected: this.checkAllSelected(cartItems),
      selectedCount: this.countSelected(cartItems),
      totalPrice: selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
    })
  },

  toggleSelect(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected }
      }
      return item
    })

    this.setData({ cartItems })
    this.calculate()
  },

  toggleSelectAll() {
    const allSelected = !this.data.allSelected
    const cartItems = this.data.cartItems.map(item => ({
      ...item,
      selected: allSelected
    }))

    this.setData({ cartItems })
    this.calculate()
  },

  updateQuantity(e) {
    const { id, type } = e.currentTarget.dataset
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id) {
        const quantity = type === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity - 1)
        return { ...item, quantity }
      }
      return item
    })

    const item = cartItems.find(i => i.id === id)
    
    this.setData({ cartItems })
    this.calculate()

    API.updateCart(id, { quantity: item.quantity })
      .catch(err => {
        console.error('更新购物车失败:', err)
      })
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          API.deleteFromCart(id)
            .then(() => {
              this.loadCart()
              wx.showToast({
                title: '已删除',
                icon: 'success'
              })
            })
            .catch(err => {
              console.error('删除购物车失败:', err)
            })
        }
      }
    })
  },

  checkout() {
    const selectedItems = this.data.cartItems.filter(item => item.selected)
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认下单',
      content: `共${selectedItems.length}件商品，金额¥${this.data.totalPrice}`,
      success: (res) => {
        if (res.confirm) {
          this.createOrder()
        }
      }
    })
  },

  createOrder() {
    const selectedItems = this.data.cartItems.filter(item => item.selected)
    
    API.createOrder({
      address: '默认收货地址'
    })
      .then(data => {
        wx.showToast({
          title: '下单成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/profile/profile'
          })
        }, 1500)
      })
      .catch(err => {
        console.error('创建订单失败:', err)
      })
  },

  goToMarket() {
    wx.switchTab({
      url: '/pages/market/index'
    })
  },

  onShareAppMessage() {
    return {
      title: '购物车 - 宁夏文旅',
      path: '/pages/cart/index'
    }
  }
});
