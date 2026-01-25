import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Space, message, Popconfirm, Tag, Card, Modal, Form, Input, InputNumber, Select } from 'antd';
import { LeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productsAPI } from '../../services/api';
import ImageUpload from '../../components/ImageUpload';

interface Product {
    id: number;
    merchant_id: number;
    name: string;
    price: number;
    stock: number;
    status: number;
    cover_image: string;
    description?: string;
    category?: string;
    images?: string; // JSON string
}

const ShopProducts: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            loadProducts(id);
        }
    }, [id]);

    const loadProducts = async (merchantId: string) => {
        setLoading(true);
        try {
            const response = await productsAPI.getList({ merchant_id: merchantId });
            if (response.data.code === 200) {
                setProducts(response.data.data || []);
            }
        } catch (error) {
            message.error('加载商品失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProduct(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setModalVisible(true);
    };

    const handleDelete = async (productId: number) => {
        try {
            await productsAPI.delete(productId);
            message.success('删除成功');
            if (id) loadProducts(id);
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleToggleStatus = async (product: Product) => {
        const newStatus = product.status === 1 ? 0 : 1;
        try {
            await productsAPI.update(product.id, { status: newStatus });
            message.success(newStatus === 1 ? '已上架' : '已下架');
            if (id) loadProducts(id);
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (id) {
                // Ensure merchant_id is set
                values.merchant_id = parseInt(id);
            }

            if (editingProduct) {
                await productsAPI.update(editingProduct.id, values);
                message.success('更新成功');
            } else {
                await productsAPI.create(values);
                message.success('创建成功');
            }
            setModalVisible(false);
            if (id) loadProducts(id);
        } catch (error) {
            message.error('操作失败');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        {
            title: '图片',
            dataIndex: 'cover_image',
            render: (src: string) => src ? <img src={src} alt="cover" style={{ width: 40, height: 40, objectFit: 'cover' }} /> : '-'
        },
        { title: '名称', dataIndex: 'name' },
        { title: '分类', dataIndex: 'category' },
        { title: '价格', dataIndex: 'price', render: (val: number) => `¥${val}` },
        { title: '库存', dataIndex: 'stock' },
        {
            title: '状态',
            dataIndex: 'status',
            render: (status: number) => status === 1 ? <Tag color="green">上架</Tag> : <Tag color="orange">下架</Tag>
        },
        {
            title: '操作',
            width: 250,
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleToggleStatus(record)}
                    >
                        {record.status === 1 ? '下架' : '上架'}
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定删除吗?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Button icon={<LeftOutlined />} onClick={() => navigate('/shops')} style={{ marginRight: 16 }}>
                        返回店铺列表
                    </Button>
                    <span style={{ fontSize: 18, fontWeight: 'bold' }}>商品管理</span>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    添加商品
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingProduct ? '编辑商品' : '创建商品'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
                        <Input placeholder="请输入商品名称" />
                    </Form.Item>

                    <Form.Item name="cover_image" label="封面图片">
                        <ImageUpload maxSize={30} />
                    </Form.Item>

                    <Form.Item name="category" label="分类">
                        <Select>
                            <Select.Option value="特色美食">特色美食</Select.Option>
                            <Select.Option value="文创产品">文创产品</Select.Option>
                            <Select.Option value="旅游纪念品">旅游纪念品</Select.Option>
                            <Select.Option value="其他">其他</Select.Option>
                        </Select>
                    </Form.Item>

                    <Space>
                        <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
                            <InputNumber min={0} precision={2} style={{ width: 150 }} prefix="¥" />
                        </Form.Item>

                        <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
                            <InputNumber min={0} precision={0} style={{ width: 150 }} />
                        </Form.Item>
                    </Space>

                    <Form.Item name="description" label="商品描述">
                        <Input.TextArea rows={4} placeholder="请输入商品详情描述" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ShopProducts;
