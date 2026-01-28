const API = require('../../../utils/request')
const app = getApp()

Page({
    data: {
        orders: [],
        loading: true,
        statusBarHeight: 20
    },

    onLoad() {
        const { statusBarHeight } = wx.getSystemInfoSync()
        this.setData({ statusBarHeight })
        this.loadOrders()
    },

    onPullDownRefresh() {
        this.loadOrders(() => {
            wx.stopPullDownRefresh()
        })
    },

    loadOrders(cb) {
        this.setData({ loading: true })
        API.getOrders({ page: 1, limit: 20 })
            .then(res => {
                const list = Array.isArray(res) ? res : (res.list || [])
                // Sort by created_at desc if not already
                list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

                this.setData({
                    orders: list,
                    loading: false
                })
                if (cb) cb()
            })
            .catch(err => {
                console.error('Failed to load orders', err)
                wx.showToast({ title: '加载失败', icon: 'none' })
                this.setData({ loading: false })
                if (cb) cb()
            })
    },

    formatTime(isoString) {
        if (!isoString) return ''
        const date = new Date(isoString)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },

    getStatusText(status) {
        const map = {
            0: '待支付',
            1: '已支付',
            2: '已发货',
            3: '已完成',
            4: '已取消'
        }
        return map[status] || '未知状态'
    }
})
