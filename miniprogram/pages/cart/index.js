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

    // 从后端加载真实购物车数据
    API.getCart()
      .then(data => {
        // 后端返回的数据格式需要转换为前端需要的格式
        // 处理 data直接为数组的情况 (后端 GetCart 返回 []models.Cart)
        const list = Array.isArray(data) ? data : (data.list || []);

        const cartItems = list.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.product?.name || '商品',
          price: item.product?.price || 0,
          quantity: item.quantity,
          coverImage: item.product?.coverImage || '/images/placeholder.jpg',
          category: item.product?.category || '',
          selected: true // 默认选中
        }))

        this.setData({
          cartItems: cartItems,
          loading: false
        })
        this.calculate()
      })
      .catch(err => {
        console.error('加载购物车失败:', err)
        // 如果加载失败，显示空购物车
        this.setData({
          cartItems: [],
          loading: false
        })
        this.calculate()
      })
  },

  // ... (checkAllSelected, countSelected, calculate, etc. unchanged) Since replacment is bounded, I don't need to repeat them if not in range. But I need to be careful with range.
  // Wait, I can't skip lines in the middle of a replace_file_content.
  // I will just replace loadCart and goToMarket separately or use multi_replace.
  // I'll use multi_replace for clarity.

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

  // 返回按钮处理
  handleBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 如果无法返回，跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },

  goToMarket() {
    wx.navigateTo({
      url: '/pages/shop/index'
    })
  },

  onShareAppMessage() {
    return {
      title: '购物车 - 宁夏文旅',
      path: '/pages/cart/index'
    }
  }
});
