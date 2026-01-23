Page({
  data: {
    scenic: null,
    id: '',
    loading: true
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadScenic(id)
    }
  },

  loadScenic(id) {
    this.setData({ loading: true })

    const scenicData = {
      1: {
        id: 1,
        name: '沙坡头',
        enName: '中卫·沙坡头',
        location: '宁夏中卫市沙坡头区迎水桥镇',
        price: 80,
        discountPrice: 40,
        hot: true,
        image: '/images/banner-2.jpg',
        images: ['/images/banner-2.jpg', '/images/product-1.jpg'],
        description: '沙坡头旅游区是国家首批5A级旅游景区，位于宁夏中卫市城区西部腾格里沙漠东南缘。这里集大漠、黄河、高山、绿洲为一体，既具有江南水乡的秀美，又具有西北雄浑的壮阔。被誉为"世界垄断性旅游资源"。',
        discount: true
      },
      2: {
        id: 2,
        name: '镇北堡西部影城',
        enName: '镇北堡西部影城',
        location: '宁夏银川市西夏区镇北堡镇',
        price: 100,
        discountPrice: 50,
        hot: true,
        image: '/images/product-1.jpg',
        images: ['/images/product-1.jpg', '/images/product-2.jpg'],
        description: '镇北堡西部影城以其古朴、原始、粗犷、荒凉的特色，在中国众多影视城中独树一帜。这里是《红高粱》、《大话西游》、《新龙门客栈》等经典影片的拍摄地，被誉为"中国电影从这里走向世界"。',
        discount: true
      },
      3: {
        id: 3,
        name: '贺兰山岩画',
        enName: '贺兰山岩画',
        location: '宁夏银川市贺兰县贺兰山岩画路',
        price: 60,
        discountPrice: 30,
        image: '/images/product-2.jpg',
        images: ['/images/product-2.jpg', '/images/product-3.jpg'],
        description: '贺兰山岩画是古代北方少数民族凿刻在岩石上的图像，反映了原始游牧民族的生活、信仰和审美。岩画内容丰富，题材广泛，是研究中国古代北方少数民族历史、文化、艺术的重要实物资料。',
        discount: true
      },
      4: {
        id: 4,
        name: '水洞沟遗址',
        enName: '水洞沟遗址',
        location: '宁夏灵武市临河镇水洞沟景区',
        price: 120,
        discountPrice: 60,
        hot: true,
        image: '/images/product-3.jpg',
        images: ['/images/product-3.jpg', '/images/product-4.jpg'],
        description: '水洞沟是中国最早发掘的旧石器时代遗址之一，被誉为"中国史前考古的发祥地"。这里不仅有丰富的古人类文化遗存，还有独特的雅丹地貌和明代长城遗迹。',
        discount: true
      },
      5: {
        id: 5,
        type: 'product',
        name: '铜仁梵净山夜光系列冰箱贴',
        price: 38.00,
        discountPrice: 38.00,
        image: '/images/product-5.jpg',
        images: ['/images/product-5.jpg', '/images/product-1.jpg'],
        sales: 5000,
        coupons: [
          { title: '满30减3', type: '减' }
        ],
        specs: ['文创冰箱贴:文创冰箱贴'],
        description: '精美文创冰箱贴，夜光效果，非常有纪念意义。',
        shopName: '宁夏文旅自营旗舰店'
      },
      101: {
        id: 101, type: 'product', name: '宁夏中宁枸杞特级红枸杞 礼盒装', price: 98.00, discountPrice: 68.00,
        image: '/images/product-1.jpg', images: ['/images/product-1.jpg'], sales: 5000,
        specs: ['500g礼盒装'], description: '正宗宁夏中宁枸杞，颗粒饱满，色泽红润，营养丰富。', shopName: '宁夏特产官方店'
      },
      102: {
        id: 102, type: 'product', name: '贺兰山东麓赤霞珠干红葡萄酒', price: 298.00, discountPrice: 198.00,
        image: '/images/product-2.jpg', images: ['/images/product-2.jpg'], sales: 1200,
        specs: ['750ml单支'], description: '来自贺兰山东麓黄金产区，口感醇厚，果香浓郁。', shopName: '贺兰美酒汇'
      },
      103: {
        id: 103, type: 'product', name: '正宗盐池滩羊肉卷 500g', price: 128.00, discountPrice: 89.00,
        image: '/images/product-3.jpg', images: ['/images/product-3.jpg'], sales: 3400,
        specs: ['500g/盒'], description: '盐池滩羊，肉质鲜嫩，不膻不腥，火锅必备。', shopName: '盐池滩羊直营'
      },
      104: {
        id: 104, type: 'product', name: '刘三朵八宝茶礼盒装', price: 88.00, discountPrice: 58.00,
        image: '/images/product-4.jpg', images: ['/images/product-4.jpg'], sales: 800,
        specs: ['10包/盒'], description: '非遗传承八宝茶，配料讲究，回味甘甜。', shopName: '宁夏非遗优选'
      },
      105: {
        id: 105, type: 'product', name: '铜仁梵净山夜光系列冰箱贴', price: 38.00, discountPrice: 38.00,
        image: '/images/product-5.jpg', images: ['/images/product-5.jpg'], sales: 200,
        specs: ['夜光款'], description: '精美文创冰箱贴，夜光效果，非常有纪念意义。', shopName: '宁夏文旅自营旗舰店'
      },
      106: {
        id: 106, type: 'product', name: '宁夏特产甘草杏 5袋装', price: 39.90, discountPrice: 29.90,
        image: '/images/product-1.jpg', images: ['/images/product-1.jpg'], sales: 10000,
        specs: ['180g*5袋'], description: '酸甜开胃，休闲零食首选，老少皆宜。', shopName: '宁夏特产官方店'
      }
    }

    const data = scenicData[id] || scenicData[1]

    this.setData({
      scenic: data,
      loading: false
    })

    wx.setNavigationBarTitle({
      title: data.name
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

  // 跳转店铺首页
  goToShop() {
    wx.navigateTo({
      url: '/pages/shop/index'
    })
  },

  // 跳转购物车
  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/index'
    })
  },

  // 加入购物车
  addToCart() {
    const app = getApp();
    app.globalData.cartTotal = (app.globalData.cartTotal || 0) + 1;

    wx.showToast({
      title: '已加入 (共' + app.globalData.cartTotal + '件)',
      icon: 'success',
      duration: 1500
    })
    // 这里可以添加更新后端购物车的逻辑
  },

  // 立即购买 / 确认购票
  buyTicket() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后操作',
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

    wx.showModal({
      title: '确认购买',
      content: '确定购买 1 件【' + this.data.scenic.name + '】吗？\n\n总价：¥' + this.data.scenic.discountPrice,
      confirmText: '立即支付',
      confirmColor: '#FF4400',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '支付成功',
            icon: 'success'
          })
          // 可以在这里跳转到订单页
        }
      }
    })
  },

  onShareAppMessage() {
    const { scenic } = this.data
    return {
      title: scenic ? scenic.name + ' - 宁夏文旅' : '宁夏好物',
      path: '/pages/market/detail?id=' + this.data.id
    }
  }
})
