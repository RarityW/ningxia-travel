import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// Contexts & Guards
import { AuthProvider } from './contexts/AuthContext';
import RequireAuth from './components/RequireAuth';

// 页面组件
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Shops from './pages/Shops/Shops';
import Food from './pages/Food/Food';
import Attractions from './pages/Attractions/Attractions';
import Orders from './pages/Orders/Orders';
import ShopProducts from './pages/Shops/ShopProducts';
import FrontendData from './pages/FrontendData/FrontendData';

// 布局组件
import Layout from './components/Layout/Layout';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router basename="/admin">
          <Routes>
            {/* 登录页 */}
            <Route path="/login" element={<Login />} />

            {/* 后台管理页面 - 受保护路由 */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route path="" element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="shops" element={<Shops />} />
              <Route path="shops/:id/products" element={<ShopProducts />} />
              <Route path="food" element={<Food />} />
              <Route path="attractions" element={<Attractions />} />
              <Route path="orders" element={<Orders />} />
              <Route path="frontend-data" element={<FrontendData />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
