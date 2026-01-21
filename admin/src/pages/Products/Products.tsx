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
import { productsAPI } from '../../services/api';

const { Option } = Select;

interface Product {
  id: number;
  name: string;
  cover_image: string;
  category: string;
  price: number;
  original_price: number;
  description: string;
  sales: number;
  stock: number;
  specifications: string;
  status: number;
  created_at: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getList();
      if (response.data.code === 200) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      message.error('加载商品数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await productsAPI.delete(id);
      message.success('删除成功');
      loadProducts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, values);
        message.success('更新成功');
      } else {
        await productsAPI.create(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '原价',
      dataIndex: 'original_price',
      key: 'original_price',
      render: (originalPrice: number) => `¥${originalPrice}`,
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        stock > 10 ? (
          <span style={{ color: 'green' }}>{stock}</span>
        ) : stock > 0 ? (
          <span style={{ color: 'orange' }}>{stock}</span>
        ) : (
          <span style={{ color: 'red' }}>缺货</span>
        )
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        status === 1 ? <Tag color="green">正常</Tag> : <Tag color="red">下架</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个商品吗？"
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
        <h2>商品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加商品
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: '明星产品',
            price: 0,
            original_price: 0,
            sales: 0,
            stock: 0,
            status: 1,
          }}
        >
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="cover_image" label="封面图片">
            <Input placeholder="图片URL" />
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Select>
              <Option value="明星产品">明星产品</Option>
              <Option value="特色食品">特色食品</Option>
              <Option value="文创周边">文创周边</Option>
            </Select>
          </Form.Item>

          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} />
          </Form.Item>

          <Form.Item name="original_price" label="原价">
            <InputNumber min={0} precision={2} />
          </Form.Item>

          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="stock" label="库存">
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item name="specifications" label="规格">
            <Input.TextArea
              rows={3}
              placeholder="JSON格式，例如：['250g装','500g装','1000g装']"
            />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select>
              <Option value={1}>上架</Option>
              <Option value={0}>下架</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;