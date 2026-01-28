// pages/shop/index.js
const API = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 0,
    banners: [
      '/images/banner-2.jpg',
      '/images/banner-1.jpg'
    ],
    currentTab: 0,
    products: [],
    selectedCategory: '', // 从首页传来的分类
    categories: [
      { key: '特色饮品', name: '特色饮品', icon: '🥤' },
      { key: '特色食品', name: '特色食品', icon: '🥘' },
      { key: '旅游纪念品', name: '旅游纪念品', icon: '🎁' },
      { key: '特色工艺品(非遗)', name: '非遗工艺', icon: '🎨' },
      { key: '文创类', name: '文创产品', icon: '📚' }
    ]
  },

  onLoad(options) {
    this.getSystemInfo();
    this.loadProducts(0);

    // 接收从首页传来的分类参数，自动跳转到品牌精选页
    if (options.category) {
      const category = decodeURIComponent(options.category);
      this.setData({
        selectedCategory: category
      });
      // 延迟跳转，让用户看到宁选好礼页面
      setTimeout(() => {
        this.navigateToBrand(category);
      }, 300);
    }
  },

  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });
  },

  // 切换中间Tabs
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      currentTab: index
    });
    this.loadProducts(index);
  },

  // 加载产品数据
  async loadProducts(tabIndex) {
    wx.showLoading({ title: '加载中' });
    this.setData({ loading: true });

    // Get category key from categories array
    // If tabIndex is out of bounds or "all", handle accordingly. 
    // Here we map tabIndex directly to categories array.
    const categoryKey = this.data.categories[tabIndex] ? this.data.categories[tabIndex].key : '';

    try {
      const res = await API.getProducts({
        page: 1,
        page_size: 20,
        category: categoryKey
      });

      this.setData({
        products: res.list || []
      });
    } catch (err) {
      console.error('加载商品失败', err);
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },

  // 导航到品牌精选页
  navigateToBrand(category) {
    wx.navigateTo({
      url: `/pages/brand/index?category=${encodeURIComponent(category)}`
    });
  },

  // 点击底部"品牌精选"按钮
  goToBrandPage() {
    // 跳转到品牌精选页，默认显示第一个分类
    wx.navigateTo({
      url: '/pages/brand/index?category=宁夏枸杞'
    });
  },

  // 点击购物车按钮
  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/index'
    });
  },

  // 点击分类快捷入口（快捷卡片）
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.navigateToBrand(category);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  onSearchTap() {
    wx.navigateTo({
      url: '/pages/search/index?type=products'
    });
  },

  onShareAppMessage() {
    return {
      title: '宁选好礼 - 宁夏文旅官方商城'
    };
  }
})
