const config = {
  baseURL: 'http://127.0.0.1:8080',
  apiVersion: '/api/v1'
}

// 封装请求方法
function request(options) {
  const token = wx.getStorageSync('token')

  return new Promise((resolve, reject) => {
    wx.request({
      url: config.baseURL + config.apiVersion + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            const data = res.data
            if (data.page !== undefined) {
              resolve({
                list: data.data,
                page: data.page,
                pageSize: data.page_size,
                total: data.total
              })
            } else {
              resolve(data.data)
            }
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          })
          setTimeout(() => {
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
          reject(res)
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET请求
function get(url, data) {
  return request({
    url,
    method: 'GET',
    data
  })
}

// POST请求
function post(url, data) {
  return request({
    url,
    method: 'POST',
    data
  })
}

// PUT请求
function put(url, data) {
  return request({
    url,
    method: 'PUT',
    data
  })
}

// DELETE请求
function del(url) {
  return request({
    url,
    method: 'DELETE'
  })
}

module.exports = {
  config,
  request,
  get,
  post,
  put,
  delete: del
}
