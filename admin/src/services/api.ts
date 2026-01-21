import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    // 优先使用localStorage中的token
    let token = localStorage.getItem('admin_token');
    let tokenFromCookie = false;

    // 如果localStorage中没有，从cookie中读取
    if (!token) {
      try {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_access_token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
          tokenFromCookie = true;
          // 同步到localStorage
          localStorage.setItem('admin_token', token);
          console.log('Token loaded from cookie, syncing to localStorage');
        }
      } catch (error) {
        console.error('Error reading cookie:', error);
      }
    }

    // 只有当token是从localStorage读取的（手动设置的）时，才添加Authorization header
    // 如果token是从cookie读取的，不添加header，让后端从cookie读取
    if (token && !tokenFromCookie) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding Authorization header for manual token');
    } else if (token && tokenFromCookie) {
      console.log('Using cookie-based authentication, no Authorization header needed');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除token，但不自动跳转，让路由守卫处理
      localStorage.removeItem('admin_token');
      console.error('401 Unauthorized - Token invalid or expired');
    }
    return Promise.reject(error);
  }
);

export default api;

// 管理员登录
export const adminLogin = (data: { username: string; password: string }) => {
  return axios.post(`${API_BASE_URL}/auth/admin/login`, data);
};

// 景点管理API
export const attractionsAPI = {
  getList: (params?: any) => api.get('/admin/attractions', { params }),
  create: (data: any) => api.post('/admin/attractions', data),
  update: (id: number, data: any) => api.put(`/admin/attractions/${id}`, data),
  delete: (id: number) => api.delete(`/admin/attractions/${id}`),
};

// 美食管理API
export const foodAPI = {
  getList: (params?: any) => api.get('/admin/food', { params }),
  create: (data: any) => api.post('/admin/food', data),
  update: (id: number, data: any) => api.put(`/admin/food/${id}`, data),
  delete: (id: number) => api.delete(`/admin/food/${id}`),
};

// 文化管理API
export const cultureAPI = {
  getList: (params?: any) => api.get('/admin/culture', { params }),
  create: (data: any) => api.post('/admin/culture', data),
  update: (id: number, data: any) => api.put(`/admin/culture/${id}`, data),
  delete: (id: number) => api.delete(`/admin/culture/${id}`),
};

// 商品管理API
export const productsAPI = {
  getList: (params?: any) => api.get('/admin/products', { params }),
  create: (data: any) => api.post('/admin/products', data),
  update: (id: number, data: any) => api.put(`/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/admin/products/${id}`),
};

// 订单管理API
export const ordersAPI = {
  getList: (params?: any) => api.get('/admin/orders', { params }),
  updateStatus: (id: number, status: number) => api.put(`/admin/orders/${id}/status`, { status }),
};

// 用户管理API
export const usersAPI = {
  getList: (params?: any) => api.get('/admin/users', { params }),
};

// 统计数据API
export const statsAPI = {
  getOverview: () => api.get('/admin/stats/overview'),
  getCharts: () => api.get('/admin/stats/charts'),
};