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
      { key: '宁夏枸杞', name: '宁夏枸杞', icon: '🍒' },
      { key: '贺兰红酒', name: '贺兰红酒', icon: '🍷' },
      { key: '盐池滩羊', name: '盐池滩羊', icon: '🐑' },
      { key: '八宝茶', name: '八宝茶', icon: '🍵' },
      { key: '非遗文创', name: '非遗文创', icon: '🎨' },
      { key: '特色美食', name: '特色美食', icon: '🥘' }
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

    try {
      const res = await API.getProducts({
        page: 1,
        page_size: 20
      });

      this.setData({
        products: res.list || []
      });
    } catch (err) {
      console.error('Fetch products failed:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
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
      url: `/pages/market/detail?id=${id}`
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
