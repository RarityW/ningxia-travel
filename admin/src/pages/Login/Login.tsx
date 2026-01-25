import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { adminLogin } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await adminLogin(values);
      if (response.data.code === 200) {
        message.success('登录成功！');

        const responseData = response.data;
        const respData = responseData.data || {};

        // Save token to localStorage as fallback
        if (respData.token) {
          localStorage.setItem('admin_token', respData.token);
          console.log('Token saved to localStorage fallback');
        } else {
          console.warn('No token found in login response for fallback');
        }

        // Update global auth state preventing redirect loop
        login(respData.token, respData.role || 'admin');

        // 立即跳转
        console.log('→ Login successful, redirecting...');
        // Use replace to prevent back button looping
        setTimeout(() => {
          // ensure we navigate relative to the basename
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>宁夏文旅后台管理系统</Title>
          <p style={{ color: '#666' }}>请登录您的管理账户</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;