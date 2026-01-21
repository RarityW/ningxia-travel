// 宁夏文旅 - 首页
Page({
  data: {
    // 系统信息
    statusBarHeight: 0, // 状态栏高度

    // 位置和天气信息
    currentLocation: '宁夏', // 当前位置
    temperature: '12.0~22.0°C', // 温度信息

    // 功能入口（10个）
    functionItems: [
      { id: 1, name: '景区门票', page: 'attractions', bgClass: 'bg-orange' },
      { id: 2, name: '酒店民宿', page: 'hotels', bgClass: 'bg-blue' },
      { id: 3, name: '线路定制', page: 'routes', bgClass: 'bg-green' },
      { id: 4, name: '宁夏特产', page: 'products', bgClass: 'bg-purple' },
      { id: 5, name: '地道美食', page: 'food', bgClass: 'bg-red' },
      { id: 6, name: '演艺活动', page: 'shows', bgClass: 'bg-pink' },
      { id: 7, name: '跟团游', page: 'tours', bgClass: 'bg-cyan' },
      { id: 8, name: '直通车', page: 'bus', bgClass: 'bg-yellow' },
      { id: 9, name: '出行服务', page: 'service', bgClass: 'bg-indigo' },
      { id: 10, name: '一日游', page: 'daytrip', bgClass: 'bg-emerald' }
    ],

    // 热玩产品
    hotProducts: [
      {
        id: 1,
        title: '沙坡头·星星酒店大漠星空体验',
        image: '/images/product-1.jpg',
        badge: '沙坡头',
        price: 190.00
      },
      {
        id: 2,
        title: '贺兰山滑雪场全天无限次畅玩券',
        image: '/images/product-2.jpg',
        badge: '贺兰山',
        price: 88.00
      },
      {
        id: 3,
        title: '镇北堡西部影城成人套票+讲解',
        image: '/images/product-3.jpg',
        badge: '西部影城',
        price: 100.00
      }
    ],
    // 精选产品
    products: [
      {
        id: 1,
        name: '宁夏枸杞',
        image: '/images/product-1.jpg',
        category: '非遗产品',
        price: 98,
        sales: 520
      },
      {
        id: 2,
        name: '宁夏葡萄酒',
        image: '/images/product-2.jpg',
        category: '明星产品',
        price: 168,
        sales: 386
      },
      {
        id: 3,
        name: '八宝茶礼盒',
        image: '/images/product-3.jpg',
        category: '特色食品',
        price: 88,
        sales: 892
      },
      {
        id: 4,
        name: '贺兰石砚',
        image: '/images/product-4.jpg',
        category: '文创周边',
        price: 588,
        sales: 156
      },
      {
        id: 5,
        name: '回族刺绣',
        image: '/images/product-5.jpg',
        category: '非遗产品',
        price: 368,
        sales: 243
      },
      {
        id: 6,
        name: '沙坡头文创',
        image: '/images/product-6.jpg',
        category: '文创周边',
        price: 128,
        sales: 567
      }
    ],
    filteredProducts: []
  },

  onLoad() {
    // 获取系统信息，用于适配顶部安全区
    this.getSystemInfo();

    // 获取用户位置和天气
    this.getLocationAndWeather();

    this.filterProducts();
  },

  // 获取系统信息，适配顶部安全区
  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 0;

    // 设置状态栏高度，用于Header定位
    this.setData({
      statusBarHeight: statusBarHeight
    });

    console.log('System info:', {
      statusBarHeight,
      model: systemInfo.model,
      platform: systemInfo.platform
    });
  },

  // 获取用户位置和天气信息
  getLocationAndWeather() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        console.log('Location success:', res);
        // 这里可以调用天气API获取实时天气
        // 暂时模拟宁夏的天气数据
        this.setData({
          currentLocation: '宁夏',
          temperature: '12.0~22.0°C'
        });
      },
      fail: (err) => {
        console.log('Location fail:', err);
        // 定位失败时显示默认数据
        this.setData({
          currentLocation: '宁夏',
          temperature: '12.0~22.0°C'
        });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '宁夏文旅 - 发现宁夏之美',
      path: '/pages/index/index'
    };
  },

  // 搜索输入处理
  onSearchInput(e) {
    const keyword = e.detail.value;
    // 这里可以添加搜索逻辑
    console.log('Search input:', keyword);
  },

  // 加载天气数据（保留原有方法以防需要）
  loadWeather() {
    const AMAP_KEY = 'YOUR_AMAP_KEY';

    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        wx.request({
          url: 'https://restapi.amap.com/v3/weather/weatherInfo',
          data: {
            key: AMAP_KEY,
            city: '640000',
            extensions: 'base'
          },
          success: (res) => {
            if (res.data && res.data.lives && res.data.lives.length > 0) {
              const lives = res.data.lives[0];
              this.setData({
                temperature: `${lives.temperature}°C`,
                weatherIcon: this.getWeatherIcon(lives.weather)
              });
            }
          },
          fail: () => {
            this.setMockWeather();
          }
        });
      },
      fail: () => {
        this.setMockWeather();
      }
    });
  },

  // 模拟天气数据
  setMockWeather() {
    const mockData = {
      temperature: Math.floor(Math.random() * 20 + 5),
      weather: this.getMockWeatherCondition()
    };
    this.setData({
      temperature: `${mockData.temperature}°C`,
      weatherIcon: this.getWeatherIcon(mockData.weather)
    });
  },

  // 获取模拟天气状况
  getMockWeatherCondition() {
    const conditions = ['晴', '多云', '阴', '小雨', '雪'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  },

  // 根据天气描述返回图标
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
    return iconMap[weather] || '☀';
  },

  // 筛选产品
  filterProducts() {
    const { products, currentCategory } = this.data;
    if (currentCategory === '全部') {
      this.setData({ filteredProducts: products });
    } else {
      this.setData({
        filteredProducts: products.filter(p => p.category === currentCategory)
      });
    }
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    this.filterProducts();
  },

  // 跳转产品详情
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/market/detail?id=${id}`
    });
  },

  // 切换定位
  switchLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        wx.showToast({
          title: '定位成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showModal({
          title: '提示',
          content: '需要获取您的地理位置信息',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      }
    });
  },

  // 功能入口点击
  onFunctionTap(e) {
    const { page } = e.currentTarget.dataset;

    // 页面跳转映射
    const pageMap = {
      'attractions': '/pages/attractions/list',
      'hotels': '', // 待开发
      'routes': '', // 待开发
      'products': '/pages/market/index',
      'food': '/pages/food/list',
      'shows': '', // 待开发
      'tours': '', // 待开发
      'bus': '', // 待开发
      'service': '', // 待开发
      'daytrip': '' // 待开发
    };

    const targetPage = pageMap[page];

    if (targetPage) {
      wx.navigateTo({
        url: targetPage
      });
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value;
    if (keyword.trim()) {
      wx.navigateTo({
        url: `/pages/attractions/list?keyword=${keyword}`
      });
    }
  }
});
