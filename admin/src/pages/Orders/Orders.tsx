import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  message,
  Space,
  Tag,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { ordersAPI } from '../../services/api';

const { Option } = Select;

interface Order {
  id: number;
  order_no: string;
  user_id: number;
  user: {
    id: number;
    nick_name: string;
  };
  total_price: number;
  status: number;
  pay_time: string | null;
  ship_time: string | null;
  address: string;
  created_at: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getList();
      if (response.data.code === 200) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      message.error('加载订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleStatusChange = async (orderId: number, status: number) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      message.success('状态更新成功');
      loadOrders();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="orange">待支付</Tag>;
      case 1:
        return <Tag color="blue">已支付</Tag>;
      case 2:
        return <Tag color="green">已发货</Tag>;
      case 3:
        return <Tag color="purple">已完成</Tag>;
      case 4:
        return <Tag color="red">已取消</Tag>;
      default:
        return <Tag>未知状态</Tag>;
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user: Order['user']) => user?.nick_name || '未知用户',
    },
    {
      title: '总价',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看详情
          </Button>
          {record.status === 1 && (
            <Select
              size="small"
              placeholder="更新状态"
              style={{ width: 100 }}
              onChange={(value) => handleStatusChange(record.id, value)}
            >
              <Option value={2}>发货</Option>
              <Option value={3}>完成</Option>
            </Select>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>订单管理</h2>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="订单详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <div>
            <p><strong>订单号:</strong> {selectedOrder.order_no}</p>
            <p><strong>用户:</strong> {selectedOrder.user?.nick_name}</p>
            <p><strong>总价:</strong> ¥{selectedOrder.total_price.toFixed(2)}</p>
            <p><strong>状态:</strong> {getStatusTag(selectedOrder.status)}</p>
            <p><strong>下单时间:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            {selectedOrder.pay_time && (
              <p><strong>支付时间:</strong> {new Date(selectedOrder.pay_time).toLocaleString()}</p>
            )}
            {selectedOrder.ship_time && (
              <p><strong>发货时间:</strong> {new Date(selectedOrder.ship_time).toLocaleString()}</p>
            )}
            <p><strong>收货地址:</strong> {selectedOrder.address || '暂无'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;