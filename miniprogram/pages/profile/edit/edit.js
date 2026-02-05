const API = require('../../../utils/request')

Page({
    data: {
        statusBarHeight: 0,
        userInfo: {
            avatar: '',
            nickName: '',
            phone: ''
        },
        saving: false
    },

    onLoad() {
        const { statusBarHeight } = wx.getSystemInfoSync()
        this.setData({ statusBarHeight })

        // Load current user info
        const userInfo = wx.getStorageSync('userInfo') || {}
        this.setData({
            userInfo: {
                avatar: userInfo.avatar || '',
                nickName: userInfo.nickName || userInfo.nickname || '',
                phone: userInfo.phone || ''
            }
        })
    },

    // Choose avatar
    onChooseAvatar(e) {
        const { avatarUrl } = e.detail
        console.log('Chosen avatar:', avatarUrl)

        // Update local preview
        this.setData({
            ['userInfo.avatar']: avatarUrl
        })

        // Upload immediately or wait for save? 
        // Usually better to upload immediately to get a permanent URL if it's a temp file, 
        // but for simplicity we can just verify the file path.
        // However, WeChat chooseAvatar returns a temp path that needs to be uploaded to our server.
        this.uploadAvatar(avatarUrl)
    },

    uploadAvatar(tempFilePath) {
        wx.showLoading({ title: '上传中...' })
        const token = wx.getStorageSync('token')

        wx.uploadFile({
            url: `${app.globalData.baseUrl}/admin/upload`, // Use existing upload endpoint
            filePath: tempFilePath,
            name: 'file',
            header: {
                'Authorization': `Bearer ${token}`
            },
            success: (res) => {
                wx.hideLoading()
                try {
                    const data = JSON.parse(res.data)
                    if (data.code === 200) {
                        // Prepend base URL for display if it's relative
                        const serverUrl = data.data.url
                        const fullUrl = serverUrl.startsWith('http') ? serverUrl : `${app.globalData.baseUrl}${serverUrl}`

                        this.setData({
                            ['userInfo.avatar']: fullUrl, // Store full URL for display
                            avatarServerPath: serverUrl   // Store relative path for saving to DB (optional, or just save full URL)
                        })
                        wx.showToast({ title: '上传成功', icon: 'success' })
                    } else {
                        wx.showToast({ title: '上传失败', icon: 'none' })
                    }
                } catch (e) {
                    wx.showToast({ title: '解析失败', icon: 'none' })
                }
            },
            fail: (err) => {
                wx.hideLoading()
                console.error('Upload failed', err)
                wx.showToast({ title: '上传出错', icon: 'none' })
            }
        })
    },

    onNicknameInput(e) {
        this.setData({
            ['userInfo.nickName']: e.detail.value
        })
    },

    onNicknameChange(e) {
        this.setData({
            ['userInfo.nickName']: e.detail.value
        })
    },

    saveProfile() {
        const { userInfo, avatarServerPath } = this.data

        if (!userInfo.nickName) {
            wx.showToast({ title: '昵称不能为空', icon: 'none' })
            return
        }

        this.setData({ saving: true })

        // Payload
        const data = {
            nickname: userInfo.nickName,
            // Use the server path if uploaded, otherwise use existing avatar
            // Note: If avatar was not changed, avatarServerPath is undefined. 
            // We should check if userInfo.avatar starts with http and extract path OR just send full URL if backend supports it.
            // Optimally, backend stores what we send.
            avatar: this.data.userInfo.avatar
        }

        API.updateProfile(data).then(res => {
            this.setData({ saving: false })
            wx.showToast({ title: '保存成功', icon: 'success' })

            // Update global/local storage user info
            const oldInfo = wx.getStorageSync('userInfo') || {}
            const newInfo = { ...oldInfo, ...data, nickName: data.nickname } // harmonize fields
            wx.setStorageSync('userInfo', newInfo)
            app.globalData.userInfo = newInfo

            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        }).catch(err => {
            this.setData({ saving: false })
            console.error(err)
            wx.showToast({ title: '保存失败', icon: 'none' })
        })
    }
})
