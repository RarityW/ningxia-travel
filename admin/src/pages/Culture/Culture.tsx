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
import { cultureAPI } from '../../services/api';

const { Option } = Select;

interface Culture {
  id: number;
  name: string;
  cover_image: string;
  category: string;
  region: string;
  description: string;
  price: number;
  views: number;
  rating: number;
  recommend: boolean;
  status: number;
  created_at: string;
}

const Culture: React.FC = () => {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCulture, setEditingCulture] = useState<Culture | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCultures();
  }, []);

  const loadCultures = async () => {
    setLoading(true);
    try {
      const response = await cultureAPI.getList();
      if (response.data.code === 200) {
        setCultures(response.data.data || []);
      }
    } catch (error) {
      message.error('加载文化数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCulture(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (culture: Culture) => {
    setEditingCulture(culture);
    form.setFieldsValue(culture);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await cultureAPI.delete(id);
      message.success('删除成功');
      loadCultures();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCulture) {
        await cultureAPI.update(editingCulture.id, values);
        message.success('更新成功');
      } else {
        await cultureAPI.create(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      loadCultures();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '文化名称',
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
      render: (price: number) => price === 0 ? '免费' : `¥${price}`,
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
      render: (_: any, record: Culture) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个文化项目吗？"
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
        <h2>文化管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加文化项目
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={cultures}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCulture ? '编辑文化项目' : '添加文化项目'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: '非遗',
            price: 0,
            views: 0,
            rating: 4.0,
            recommend: false,
            status: 1,
          }}
        >
          <Form.Item name="name" label="文化名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="cover_image" label="封面图片">
            <Input placeholder="图片URL" />
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Select>
              <Option value="非遗">非物质文化遗产</Option>
              <Option value="工艺品">工艺品</Option>
              <Option value="书画">书画</Option>
              <Option value="民俗">民俗文化</Option>
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

export default Culture;