Page({
  data: {
    discountType: 5,
    currentTab: 0,
    scenicList: [
      { id: 1, name: '沙坡头', enName: '中卫·沙坡头', image: '/images/scenic-shapotou.jpg', price: 80, discountPrice: 40 },
      { id: 2, name: '镇北堡', enName: '镇北堡西部影城', image: '/images/scenic-zhenbeibu.jpg', price: 100, discountPrice: 50 },
      { id: 3, name: '贺兰山', enName: '贺兰山岩画', image: '/images/scenic-helan.jpg', price: 60, discountPrice: 30 },
      { id: 4, name: '水洞沟', enName: '水洞沟遗址', image: '/images/scenic-shuidonggou.jpg', price: 120, discountPrice: 60 }
    ],
    qualified: false,
    ticketCode: ''
  },

  onLoad() {
    this.checkQualification()
  },

  onShow() {
    this.checkQualification()
  },

  checkQualification() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({ qualified: true })
    }
  },

  onDiscountTap() {
    wx.showModal({
      title: '5折优惠说明',
      content: '凭指定景区门票核销后，可享受全区A级景区门票5折优惠。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#8B4513'
    })
  },

  onAuthTap() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再进行免票认证',
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
      title: '免票人群认证',
      content: '请选择您的免票类型：\n\n• 60周岁以上老年人\n• 身高1.2米以下儿童\n• 医护人员\n• 军人/消防员',
      confirmText: '去认证',
      confirmColor: '#8B4513',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '认证功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  onRulesTap() {
    wx.showModal({
      title: '活动规则',
      content: '1. 购买"大美宁夏·风情塞上"系列景区任一门票\n2. 凭票根到景区核销后激活优惠\n3. 激活后可享受全区A级景区5折门票\n4. 优惠有效期至2024年12月31日\n5. 本活动最终解释权归宁夏文旅集团所有',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#8B4513'
    })
  },

  onQueryTap() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查询权益资格',
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
      title: '权益资格查询',
      content: '您当前享有全区A级景区5折优惠资格。\n\n有效期至：2024年12月31日\n已优惠景区：沙坡头、镇北堡西部影城',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#8B4513'
    })
  },

  onScenicTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/market/detail?id=${id}`
    })
  },

  onShareAppMessage() {
    return {
      title: '宁夏旅游门票5折优惠 - 一码游宁夏',
      path: '/pages/market/index'
    }
  }
})
