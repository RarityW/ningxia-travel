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
import { attractionsAPI } from '../../services/api';
import ImageUpload from '../../components/ImageUpload';

const { Option } = Select;

interface Attraction {
  id: number;
  name: string;
  english_name: string;
  cover_image: string;
  grade: string;
  category: string;
  region: string;
  address: string;
  description: string;
  ticket_price: number;
  phone: string;
  views: number;
  rating: number;
  recommend: boolean;
  status: number;
  created_at: string;
}

const Attractions: React.FC = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAttractions();
  }, []);

  const loadAttractions = async () => {
    setLoading(true);
    try {
      const response = await attractionsAPI.getList();
      if (response.data.code === 200) {
        setAttractions(response.data.data || []);
      }
    } catch (error) {
      message.error('加载景点数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAttraction(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (attraction: Attraction) => {
    setEditingAttraction(attraction);
    form.setFieldsValue(attraction);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await attractionsAPI.delete(id);
      message.success('删除成功');
      loadAttractions();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingAttraction) {
        await attractionsAPI.update(editingAttraction.id, values);
        message.success('更新成功');
      } else {
        await attractionsAPI.create(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      loadAttractions();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '景点名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '等级',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: string) => (
        <Tag color={grade === '5A' ? 'red' : grade === '4A' ? 'orange' : 'blue'}>
          {grade}
        </Tag>
      ),
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: '票价',
      dataIndex: 'ticket_price',
      key: 'ticket_price',
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
      render: (_: any, record: Attraction) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个景点吗？"
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
        <h2>景点管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加景点
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={attractions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingAttraction ? '编辑景点' : '添加景点'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            grade: '4A',
            category: '自然',
            ticket_price: 0,
            views: 0,
            rating: 4.0,
            recommend: false,
            status: 1,
          }}
        >
          <Form.Item name="name" label="景点名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="english_name" label="英文名称">
            <Input />
          </Form.Item>

          <Form.Item name="cover_image" label="封面图片">
            <ImageUpload />
          </Form.Item>

          <Form.Item name="grade" label="等级">
            <Select>
              <Option value="5A">5A</Option>
              <Option value="4A">4A</Option>
              <Option value="3A">3A</Option>
            </Select>
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Select>
              <Option value="自然">自然</Option>
              <Option value="历史">历史</Option>
              <Option value="文化">文化</Option>
            </Select>
          </Form.Item>

          <Form.Item name="region" label="地区" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="ticket_price" label="票价">
            <InputNumber min={0} precision={2} />
          </Form.Item>

          <Form.Item name="phone" label="电话">
            <Input />
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

export default Attractions;