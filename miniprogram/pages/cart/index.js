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
    this.setData({ loading: true })

    // 模拟购物车数据，避免后端连接失败
    const mockCartItems = [
      { id: '101', name: '宁夏中宁枸杞特级红枸杞 礼盒装', price: 68.00, quantity: 1, image: '/images/product-1.jpg', selected: true },
      { id: '103', name: '正宗盐池滩羊肉卷 500g', price: 89.00, quantity: 2, image: '/images/product-3.jpg', selected: true }
    ];

    // 如果全局有计数，稍微模拟一下数量变化（可选）
    const app = getApp();
    if (app.globalData.cartTotal > 3) {
      mockCartItems[0].quantity += (app.globalData.cartTotal - 3);
    }

    setTimeout(() => {
      this.setData({
        cartItems: mockCartItems,
        loading: false
      })
      this.calculate()
    }, 500)
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
    const item = this.data.cartItems.find(i => i.id === id)

    if (!item) return

    if (type === 'decrease' && item.quantity === 1) {
      // 减到1时再减，询问是否删除
      this.deleteItem({ currentTarget: { dataset: { id } } })
      return
    }

    const newQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1

    // 乐观更新
    const cartItems = this.data.cartItems.map(i => {
      if (i.id === id) {
        return { ...i, quantity: newQuantity }
      }
      return i
    })

    this.setData({ cartItems })
    this.calculate()

    // 异步同步后端
    API.updateCart(id, { quantity: newQuantity })
      .catch(err => {
        console.error('更新购物车失败:', err)
        // 回滚 (可选，这里简化处理)
      })
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {

          // 乐观更新：先从列表中移除
          const newCartItems = this.data.cartItems.filter(item => item.id !== id)

          this.setData({ cartItems: newCartItems })
          this.calculate()

          wx.showToast({
            title: '已删除',
            icon: 'none'
          })

          // 后台同步
          API.deleteFromCart(id)
            .catch(err => {
              console.error('删除购物车失败:', err)
              // 失败恢复 (可选)
              this.loadCart()
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
