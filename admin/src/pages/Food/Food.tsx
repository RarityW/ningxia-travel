import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { foodAPI } from '../../services/api';
import ImageUpload from '../../components/ImageUpload';

const { Option } = Select;

interface Food {
  id: number;
  name: string;
  cover_image: string;
  category: string;
  region: string;
  description: string;
  price: number;
  shops: string;
  views: number;
  rating: number;
  recommend: boolean;
  status: number;
  created_at: string;
}

const Food: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const response = await foodAPI.getList();
      if (response.data.code === 200) {
        setFoods(response.data.data || []);
      }
    } catch (error) {
      message.error('加载美食数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingFood(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    form.setFieldsValue(food);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await foodAPI.delete(id);
      message.success('删除成功');
      loadFoods();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingFood) {
        await foodAPI.update(editingFood.id, values);
        message.success('更新成功');
      } else {
        await foodAPI.create(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      loadFoods();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '美食名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '推荐',
      dataIndex: 'recommend',
      key: 'recommend',
      render: (recommend: boolean) => (
        recommend ? <Tag color="green">推荐</Tag> : <Tag>普通</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        status === 1 ? <Tag color="green">正常</Tag> : <Tag color="red">禁用</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Food) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个美食吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>美食管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加美食
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={foods}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingFood ? '编辑美食' : '添加美食'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: '特色菜',
            price: 0,
            views: 0,
            rating: 4.0,
            recommend: false,
            status: 1,
          }}
        >
          <Form.Item name="name" label="美食名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="cover_image" label="封面图片">
            <ImageUpload />
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Select>
              <Option value="特色菜">特色菜</Option>
              <Option value="小吃">小吃</Option>
              <Option value="饮品">饮品</Option>
              <Option value="主食">主食</Option>
            </Select>
          </Form.Item>

          <Form.Item name="region" label="地区" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="price" label="价格">
            <InputNumber min={0} precision={2} />
          </Form.Item>

          <Form.Item name="shops" label="店铺">
            <Input.TextArea
              rows={2}
              placeholder="多个店铺用逗号分隔"
            />
          </Form.Item>

          <Form.Item name="recommend" label="推荐">
            <Select>
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select>
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Food;