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

  buyTicket() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后购票',
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
      title: '确认购票',
      content: '确定购买【' + this.data.scenic.name + '】门票吗？\n\n优惠价：¥' + this.data.scenic.discountPrice + '\n原价：¥' + this.data.scenic.price,
      confirmText: '确认购买',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '购票成功',
            icon: 'success'
          })
        }
      }
    })
  },

  onShareAppMessage() {
    const { scenic } = this.data
    return {
      title: scenic ? scenic.name + ' - 宁夏旅游门票优惠' : '宁夏旅游门票优惠',
      path: '/pages/market/detail?id=' + this.data.id
    }
  }
})
