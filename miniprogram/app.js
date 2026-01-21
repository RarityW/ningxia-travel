// app.js
const API = require('./utils/request')

App({
  onLaunch() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    this.globalData.token = token
    this.globalData.userInfo = userInfo
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            API.login({
              openid: res.code
            }).then(data => {
              wx.setStorageSync('token', data.token)
              wx.setStorageSync('userInfo', data)
              
              this.globalData.token = data.token
              this.globalData.userInfo = data
              
              resolve(data)
            }).catch(err => {
              reject(err)
            })
          } else {
            reject(new Error('wx.login失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo
          wx.setStorageSync('userInfo', userInfo)
          this.globalData.userInfo = userInfo
          resolve(userInfo)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  globalData: {
    token: null,
    userInfo: null,
    baseURL: 'http://localhost:8080'
  }
});
