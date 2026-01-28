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

interface OrderItem {
  id: number;
  product_id: number;
  product: {
    name: string;
    cover_image: string;
  };
  quantity: number;
  price: number;
}

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
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      case 0: return <Tag color="orange">待支付</Tag>;
      case 1: return <Tag color="blue">已支付</Tag>;
      case 2: return <Tag color="green">已发货</Tag>;
      case 3: return <Tag color="purple">已完成</Tag>;
      case 4: return <Tag color="red">已取消</Tag>;
      default: return <Tag>未知状态</Tag>;
    }
  };

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '用户ID', dataIndex: 'user_id', key: 'user_id' },
    {
      title: '用户昵称',
      dataIndex: 'user',
      key: 'user_name',
      render: (user: any) => user?.nickname || '未知'
    },
    {
      title: '商品摘要',
      dataIndex: 'items',
      key: 'items',
      ellipsis: true,
      render: (items: OrderItem[]) => items?.map(i => i.product?.name).join(', ') || '-'
    },
    { title: '总价', dataIndex: 'total_price', key: 'total_price', render: (val: number) => `¥${val.toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: '下单时间', dataIndex: 'created_at', key: 'created_at', render: (val: string) => new Date(val).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          {record.status === 1 && (
            <Select
              size="small"
              placeholder="发货"
              onChange={(val) => handleStatusChange(record.id, val)}
              style={{ width: 100 }}
            >
              <Option value={2}>发货</Option>
            </Select>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}><h2>订单管理</h2></div>
      <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} />

      <Modal
        title="订单详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <p><strong>订单号:</strong> {selectedOrder.order_no}</p>
            <p><strong>用户ID:</strong> {selectedOrder.user_id}</p>
            <p><strong>下单时间:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>

            <Table
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              columns={[
                { title: '商品ID', dataIndex: 'product_id' },
                { title: '商品名称', dataIndex: ['product', 'name'] },
                { title: '单价', dataIndex: 'price', render: (v) => `¥${v}` },
                { title: '数量', dataIndex: 'quantity' },
                { title: '小计', render: (_, r) => `¥${(r.price * r.quantity).toFixed(2)}` }
              ]}
            />

            <div style={{ marginTop: 16, textAlign: 'right', fontSize: 18, fontWeight: 'bold' }}>
              总金额: ¥{selectedOrder.total_price.toFixed(2)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;