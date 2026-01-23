// components/custom-nav/index.js
Component({
    properties: {
        title: {
            type: String,
            value: ''
        },
        back: {
            type: Boolean,
            value: true
        },
        background: {
            type: String,
            value: 'transparent'
        },
        color: {
            type: String,
            value: '#000000'
        }
    },

    data: {
        statusBarHeight: 20,
        navHeight: 44
    },

    lifetimes: {
        attached() {
            const systemInfo = wx.getSystemInfoSync();
            this.setData({
                statusBarHeight: systemInfo.statusBarHeight,
                navHeight: 44 // 标准导航栏高度
            });
        }
    },

    methods: {
        goBack() {
            wx.navigateBack({
                delta: 1,
                fail: () => {
                    // 如果无法返回（例如分享卡片进入），则回首页
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                }
            });
        }
    }
})
