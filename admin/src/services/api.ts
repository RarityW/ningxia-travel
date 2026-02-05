import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // withCredentials: true, // 暂时关闭，专注于 Header 认证
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 简单粗暴版本
api.interceptors.request.use(
  (config) => {
    // 1. 直接读取 LocalStorage
    const token = localStorage.getItem('admin_token');

    // 2. 只有有值，就强制塞进去
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }

      // Fix for Axios v1.x: config.headers is AxiosHeaders
      if (typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('Authorization', `Bearer ${token}`);
      } else {
        // Fallback for older versions or plain objects
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('[API] Added token to header:', token.substring(0, 10) + '...');
    } else {
      console.warn('[API] No token found in localStorage');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // 防止重复提示
        if (!window.location.pathname.includes('/login')) {
          message.error('登录已过期，请重新登录');
        }
        console.error('[API] 401 Unauthorized - redirecting to login');
        localStorage.removeItem('admin_token');

        if (window.location.pathname !== '/login') {
          // 给一点时间让提示显示
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      } else if (status === 403) {
        message.error('没有权限执行此操作');
      } else if (status >= 500) {
        message.error('服务器出错了，请稍后再试');
      } else {
        // 其他错误，如果有返回错误信息则显示，否则显示默认文案
        message.error(data?.error || data?.message || '请求失败');
      }
    } else if (error.request) {
      // 网络错误（无响应）
      message.error('网络连接异常，请检查网络');
    } else {
      message.error('请求配置发生错误');
    }
    return Promise.reject(error);
  }
);

export default api;

// ================= API 定义 =================

// 管理员登录
export const adminLogin = (data: { username: string; password: string }) => {
  // 注意：登录接口不走拦截器也没关系，或者走了也不带 Token (因为还没存)
  // 这里直接用 axios 原始实例也可以，或者用 api 实例
  return axios.post(`${API_BASE_URL}/auth/admin/login`, data);
};

// 获取管理员信息 
export const getAdminProfile = () => {
  return api.get('/admin/profile');
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

// 商家管理API
export const merchantsAPI = {
  getList: (params?: any) => api.get('/admin/merchants', { params }),
  create: (data: any) => api.post('/admin/merchants', data),
  update: (id: number, data: any) => api.put(`/admin/merchants/${id}`, data),
  delete: (id: number) => api.delete(`/admin/merchants/${id}`),
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

// 素材管理API
export const assetsAPI = {
  getList: (params?: any) => api.get('/admin/assets', { params }),
  create: (data: any) => api.post('/admin/assets', data),
  update: (id: number, data: any) => api.put(`/admin/assets/${id}`, data),
  delete: (id: number) => api.delete(`/admin/assets/${id}`),
};