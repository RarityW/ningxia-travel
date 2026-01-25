// API接口封装
const api = require('./api')

const API = {
  // 登录
  // 登录 (WeChat)
  login: (data) => api.post('/auth/login', data),
  // 用户注册 (Phone/Pwd)
  userRegister: (data) => api.post('/auth/user/register', data),
  // 用户登录 (Phone/Pwd)
  userLogin: (data) => api.post('/auth/user/login', data),

  // 获取用户信息
  getUserProfile: () => api.get('/user/profile'),

  // 更新用户信息
  updateProfile: (data) => api.put('/user/profile', data),

  // 景点
  getAttractions: (params) => api.get('/attractions', params),
  getAttraction: (id) => api.get(`/attractions/${id}`),

  // 美食
  getFoods: (params) => api.get('/food', params),
  getFood: (id) => api.get(`/food/${id}`),

  // 文化
  getCultures: (params) => api.get('/culture', params),
  getCulture: (id) => api.get(`/culture/${id}`),

  // 商品
  getProducts: (params) => api.get('/market', params),
  getProduct: (id) => api.get(`/market/${id}`),

  // 收藏
  getFavorites: () => api.get('/user/favorites'),
  addFavorite: (data) => api.post('/user/favorites', data),
  deleteFavorite: (id) => api.delete(`/user/favorites/${id}`),

  // 购物车
  getCart: () => api.get('/user/cart'),
  addToCart: (data) => api.post('/user/cart', data),
  updateCart: (id, data) => api.put(`/user/cart/${id}`, data),
  deleteFromCart: (id) => api.delete(`/user/cart/${id}`),

  // 订单
  getOrders: (params) => api.get('/user/orders', params),
  getOrder: (id) => api.get(`/user/orders/${id}`),
  createOrder: (data) => api.post('/user/orders', data),

  // 优惠券
  getCoupons: () => api.get('/user/coupons'),

  // 位置和天气
  getLocation: (longitude, latitude) => api.get('/location', { longitude, latitude }),
  getWeather: (city) => api.get('/weather', { city })
}

module.exports = API
