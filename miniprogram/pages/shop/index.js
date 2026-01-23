// pages/shop/index.js
Page({
  data: {
    statusBarHeight: 0,
    banners: [
      '/images/banner-2.jpg', // Placeholder
      '/images/banner-1.jpg'
    ],
    currentTab: 0, // 0: 明星产品, 1: 当季直销, 2: 助农扶农
    products: []
  },

  onLoad(options) {
    this.getSystemInfo();
    this.loadProducts(0);
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

  // 加载产品数据 (Mock)
  loadProducts(tabIndex) {
    wx.showLoading({ title: '加载中' });

    // 基础数据
    const allProducts = [
      { id: 101, name: '宁夏中宁枸杞特级红枸杞 礼盒装', image: '/images/product-1.jpg', price: 68.00, sales: 5000 },
      { id: 102, name: '贺兰山东麓赤霞珠干红葡萄酒', image: '/images/product-2.jpg', price: 198.00, sales: 1200 },
      { id: 103, name: '正宗盐池滩羊肉卷 500g', image: '/images/product-3.jpg', price: 89.00, sales: 3400 },
      { id: 104, name: '刘三朵八宝茶礼盒装', image: '/images/product-4.jpg', price: 58.00, sales: 800 },
      { id: 105, name: '铜仁梵净山夜光系列冰箱贴', image: '/images/product-5.jpg', price: 38.00, sales: 200 },
      { id: 106, name: '宁夏特产甘草杏 5袋装', image: '/images/product-1.jpg', price: 29.90, sales: 10000 },
    ];

    // 简单模拟筛选
    let filtered = [];
    if (tabIndex === 0) {
      filtered = allProducts; // 明星产品：全部
    } else if (tabIndex === 1) {
      filtered = allProducts.slice(0, 3); // 当季直销：取前3
    } else {
      filtered = allProducts.slice(3, 6); // 助农扶农：取后3
    }

    setTimeout(() => {
      this.setData({
        products: filtered
      });
      wx.hideLoading();
    }, 300);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/market/detail?id=${id}` // 暂时复用market详情页
    });
  },

  onShareAppMessage() {
    return {
      title: '宁选好礼 - 宁夏文旅官方商城'
    };
  }
})
