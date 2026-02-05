// 宁夏文旅 - 首页
const API = require('../../utils/request')

Page({
  data: {
    statusBarHeight: 44,
    currentLocation: '宁夏',
    temperature: '21°C',

    // 首页商城分类
    shopCategories: [
      { id: 1, name: '宁夏枸杞', icon: '🍒', color: 'rgba(255, 0, 0, 0.1)' },
      { id: 2, name: '贺兰红酒', icon: '🍷', color: 'rgba(128, 0, 128, 0.1)' },
      { id: 3, name: '盐池滩羊', icon: '🐑', color: 'rgba(255, 165, 0, 0.1)' },
      { id: 4, name: '八宝茶', icon: '🍵', color: 'rgba(0, 128, 0, 0.1)' },
      { id: 5, name: '非遗文创', icon: '🎨', color: 'rgba(0, 0, 255, 0.1)' },
      { id: 6, name: '特色美食', icon: '🥘', color: 'rgba(255, 192, 203, 0.1)' }
    ],

    hotAttractions: [],
    products: [],
    filteredProducts: [],

    // 当季热玩分类
    hotTabs: ['推荐', '自然风光', '人文景观', '历史遗迹'],
    currentHotTab: 0,

    // 首页Banner
    banners: [
      { id: 1, image_url: '/images/banner-1.jpg', title: '旅游来宁夏 给心放个假' },
      { id: 2, image_url: '/images/banner-2.jpg', title: '大漠黄河 西夏古韵' }
    ]
  },

  goToShop(e) {
    const index = e.currentTarget.dataset.id;
    const category = this.data.shopCategories[index];

    // 跳转到宁选好礼页，传递分类参数
    if (category) {
      wx.navigateTo({
        url: `/pages/shop/index?category=${encodeURIComponent(category.name)}`
      });
    } else {
      // 点击"更多好物"时跳转到宁选好礼页（不带分类参数）
      wx.navigateTo({
        url: '/pages/shop/index'
      });
    }
  },


  onLoad() {
    this.getSystemInfo();
    this.getLocationAndWeather();
    this.loadProducts();
    this.loadProducts();
    this.loadHotAttractions();
    this.loadBanners();
  },

  async loadBanners() {
    try {
      const res = await API.getAssets('home_banner');
      if (res.list && res.list.length > 0) {
        // 拼接完整图片URL
        const baseUrl = 'http://127.0.0.1:8080';
        const bannersWithFullUrl = res.list.map(item => ({
          ...item,
          imageUrl: item.imageUrl.startsWith('http') ? item.imageUrl : baseUrl + item.imageUrl
        }));
        this.setData({
          banners: bannersWithFullUrl
        });
      }
    } catch (err) {
      console.error('Load banners failed', err);
    }
  },

  async loadHotAttractions(category = '全部') {
    try {
      const params = {
        page: 1,
        page_size: 6
      };

      // 添加分类参数（如果是'推荐'则不传category或传all，虽然API可能需要映射）
      if (category !== '推荐' && category !== '全部') {
        params.category = category;
      }

      const res = await API.getAttractions(params);
      this.setData({
        hotAttractions: res.list || []
      });
    } catch (err) {
      console.error('Load hot attractions failed', err);
    }
  },

  onHotTabChange(e) {
    const index = e.currentTarget.dataset.index;
    const category = this.data.hotTabs[index];

    if (index === this.data.currentHotTab) return;

    this.setData({
      currentHotTab: index
    });

    this.loadHotAttractions(category);
  },

  async loadProducts() {
    try {
      const res = await API.getProducts({ page: 2, page_size: 6 });
      this.setData({
        products: res.list || [],
        filteredProducts: res.list || []
      });
    } catch (err) {
      console.error('Load products failed', err);
    }
  },

  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 44
    });
  },

  onFunctionTap(e) {
    const page = e.currentTarget.dataset.page;
    const pageMap = {
      'attractions': '/pages/attractions/list',
      'hotels': '/pages/index/index',
      'routes': '/pages/index/index',
      'products': '/pages/shop/index',
      'food': '/pages/food/list',
      'shows': '/pages/index/index',
      'tours': '/pages/index/index',
      'bus': '/pages/index/index',
      'service': '/pages/index/index',
      'daytrip': '/pages/index/index'
    };

    const url = pageMap[page];
    if (url === '/pages/index/index') {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    } else {
      wx.navigateTo({ url });
    }
  },

  onSearchTap() {
    wx.navigateTo({
      url: '/pages/search/index'
    });
  },

  goToAttractions() {
    wx.navigateTo({
      url: '/pages/attractions/list'
    });
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  goToAttractionDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/attractions/detail?id=${id}`
    });
  },

  goToDiscount() {
    wx.switchTab({
      url: '/pages/market/index'
    });
  },

  getLocationAndWeather() {
    const that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation'] === false) {
          wx.showModal({
            title: '授权提示',
            content: '需要获取您的位置信息，以提供更好的服务',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              } else {
                that.setData({
                  currentLocation: '宁夏',
                  temperature: '21°C'
                });
                wx.showToast({
                  title: '授权位置可获取实时天气',
                  icon: 'none'
                });
              }
            }
          });
        } else {
          that.doGetLocation();
        }
      }
    });
  },

  doGetLocation() {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        that.getCityName(latitude, longitude);
        that.getWeather(latitude, longitude);
      },
      fail(err) {
        console.error('Location fail:', err);
        that.setData({
          currentLocation: '宁夏',
          temperature: '21°C'
        });
      }
    });
  },

  getCityName(lat, lng) {
    API.getLocation(lng, lat)
      .then(data => {
        const city = data.city || data.province || '宁夏'
        this.setData({
          currentLocation: city.replace('市', '')
        })
      })
      .catch(err => {
        console.error('获取位置失败:', err)
        this.setData({
          currentLocation: '银川'
        })
      })
  },

  getWeather(lat, lng) {
    API.getLocation(lng, lat)
      .then(data => {
        const city = data.city || data.province || '银川'
        return API.getWeather(city)
      })
      .then(data => {
        this.setData({
          temperature: data.temperature || '21°C'
        })
      })
      .catch(err => {
        console.error('获取天气失败:', err)
        const temp = Math.floor(Math.random() * (25 - 15) + 15)
        this.setData({
          temperature: `${temp}°C`
        })
      })
  },

  getWeatherIcon(weather) {
    const iconMap = {
      '晴': '☀',
      '多云': '⛅',
      '阴': '☁',
      '雨': '🌧',
      '雪': '❄',
      '雷阵雨': '⛈',
      '雾': '🌫'
    };
    return iconMap[weather] || '⛅';
  },

  onShareAppMessage() {
    return {
      title: '宁夏文旅 - 塞上江南，神奇宁夏',
      path: '/pages/index/index'
    };
  }
})
