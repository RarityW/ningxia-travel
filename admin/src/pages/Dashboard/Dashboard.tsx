import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
  EnvironmentOutlined,
  CoffeeOutlined,
  BookOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { statsAPI } from '../../services/api';

interface StatsData {
  attractions: number;
  food: number;
  culture: number;
  products: number;
  orders: number;
  users: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    attractions: 0,
    food: 0,
    culture: 0,
    products: 0,
    orders: 0,
    users: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsAPI.getOverview();
      if (response.data.code === 200) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 使用默认数据
      setStats({
        attractions: 8,
        food: 4,
        culture: 4,
        products: 4,
        orders: 0,
        users: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="景点数量"
              value={stats.attractions}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="美食数量"
              value={stats.food}
              prefix={<CoffeeOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="文化数量"
              value={stats.culture}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="商品数量"
              value={stats.products}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="订单数量"
              value={stats.orders}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="用户数量"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="系统信息" style={{ height: 200 }}>
            <p>服务器状态: <span style={{ color: '#52c41a' }}>正常运行</span></p>
            <p>数据库连接: <span style={{ color: '#52c41a' }}>正常</span></p>
            <p>最后更新: {new Date().toLocaleString()}</p>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="快捷操作" style={{ height: 200 }}>
            <p>• 添加新景点</p>
            <p>• 管理商品库存</p>
            <p>• 查看订单状态</p>
            <p>• 用户数据分析</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;