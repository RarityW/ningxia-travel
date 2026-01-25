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
            // 触发自定义返回事件
            const eventDetail = {};
            const eventOption = {
                bubbles: true,
                composed: true,
                capturePhase: false
            };

            // 记录是否执行了自定义逻辑
            let customHandled = false;

            // 通过检查页面是否有handleBack方法来决定是否使用默认逻辑
            const pages = getCurrentPages();
            if (pages.length > 0) {
                const currentPage = pages[pages.length - 1];
                if (typeof currentPage.handleBack === 'function') {
                    // 页面有自定义handleBack，触发事件
                    this.triggerEvent('onBack', eventDetail, eventOption);
                    customHandled = true;
                }
            }

            // 如果没有自定义处理，执行默认返回逻辑
            if (!customHandled) {
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
    }
})
