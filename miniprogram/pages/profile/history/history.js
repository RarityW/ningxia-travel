const app = getApp()
const API = require('../../../utils/request')

Page({
    data: {
        statusBarHeight: 0,
        historyList: [],
        loading: false
    },

    onLoad() {
        const { statusBarHeight } = wx.getSystemInfoSync()
        this.setData({ statusBarHeight })
    },

    onShow() {
        this.loadHistory()
    },

    loadHistory() {
        this.setData({ loading: true })
        API.getHistory().then(res => {
            // Add formatted time or process image URLs if needed
            // The backend returns models.BrowsingHistory list.
            // We need to ensure fields match. API wrapper toCamelCase handles snake_case -> camelCase.
            // Expected fields: id, targetId, targetType, title, image, price, createdAt

            const list = (res.list || res).map(item => {
                // Simple time formatting
                let timeFormatted = '刚刚'
                if (item.createdAt) {
                    const date = new Date(item.createdAt)
                    timeFormatted = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
                }

                // Ensure image has base URL if needed (though we saved it with base URL or backend served it relative? 
                // In detail pages we saved full URL if we used what was in `data` which we processed.
                // If we saved relative path, we prepend. 
                // Best to check.
                let image = item.image
                if (image && !image.startsWith('http')) {
                    image = app.globalData.baseUrl + image
                }

                return {
                    ...item,
                    timeFormatted,
                    image
                }
            })

            this.setData({
                historyList: list,
                loading: false
            })
        }).catch(err => {
            console.error(err)
            this.setData({ loading: false })
        })
    },

    goToDetail(e) {
        const { id, type } = e.currentTarget.dataset
        let url = ''

        switch (type) {
            case 'attraction':
                url = `/pages/attractions/detail?id=${id}`
                break
            case 'food':
                url = `/pages/food/detail?id=${id}`
                break
            case 'culture':
                url = `/pages/culture/detail?id=${id}`
                break
            case 'product':
                url = `/pages/market/detail?id=${id}`
                break
            default:
                return
        }

        if (url) {
            wx.navigateTo({ url })
        }
    }
})
