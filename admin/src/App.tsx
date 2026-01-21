import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 页面组件
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Attractions from './pages/Attractions/Attractions';
import Food from './pages/Food/Food';
import Culture from './pages/Culture/Culture';
import Products from './pages/Products/Products';
import Orders from './pages/Orders/Orders';
import Users from './pages/Users/Users';

// 布局组件
import Layout from './components/Layout/Layout';

// 路由守卫组件 - 临时禁用，依赖后端cookie认证
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 临时允许所有访问，依赖后端的cookie认证
  console.log('PrivateRoute: Allowing access (relying on backend cookie auth)');
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 登录页 */}
          <Route path="/login" element={<Login />} />

          {/* 后台管理页面 */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="" element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attractions" element={<Attractions />} />
            <Route path="food" element={<Food />} />
            <Route path="culture" element={<Culture />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
