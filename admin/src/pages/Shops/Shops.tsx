import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Upload, message, Space, Tag, Popconfirm, Drawer, InputNumber, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, InboxOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Dragger } = Upload;
const { TextArea } = Input;

interface Shop {
    id: number;
    name: string;
    logo: string;
    description: string;
    status: number;
    productCount?: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    status: number;
    image: string;
}

// 模拟数据
const mockShops: Shop[] = [
    { id: 1, name: '宁夏特产旗舰店', logo: '/uploads/shop1.jpg', description: '正宗宁夏枸杞、滩羊肉', status: 1, productCount: 12 },
    { id: 2, name: '贺兰山葡萄酒庄', logo: '/uploads/shop2.jpg', description: '优质贺兰山东麓葡萄酒', status: 1, productCount: 8 },
];

const mockProducts: Product[] = [
    { id: 1, name: '中宁枸杞 500g', price: 68.00, stock: 100, status: 1, image: '/uploads/p1.jpg' },
    { id: 2, name: '盐池滩羊肉 2kg', price: 298.00, stock: 50, status: 1, image: '/uploads/p2.jpg' },
    { id: 3, name: '手工羊毛毯', price: 580.00, stock: 20, status: 0, image: '/uploads/p3.jpg' },
];

const Shops: React.FC = () => {
    const [shops, setShops] = useState<Shop[]>(mockShops);
    const [shopModalOpen, setShopModalOpen] = useState(false);
    const [productDrawerOpen, setProductDrawerOpen] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [currentShop, setCurrentShop] = useState<Shop | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [shopForm] = Form.useForm();
    const [productForm] = Form.useForm();

    const shopColumns: ColumnsType<Shop> = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '店铺名称', dataIndex: 'name' },
        { title: '简介', dataIndex: 'description', ellipsis: true },
        { title: '商品数', dataIndex: 'productCount', width: 80 },
        {
            title: '状态', dataIndex: 'status', width: 80,
            render: (status) => status === 1 ? <Tag color="green">营业中</Tag> : <Tag color="red">已关闭</Tag>
        },
        {
            title: '操作', width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewProducts(record)}>商品</Button>
                    <Popconfirm title="确定删除该店铺？" onConfirm={() => handleDeleteShop(record.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const productColumns: ColumnsType<Product> = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '商品名称', dataIndex: 'name' },
        { title: '价格', dataIndex: 'price', render: (v) => `¥${v.toFixed(2)}` },
        { title: '库存', dataIndex: 'stock' },
        {
            title: '状态', dataIndex: 'status', width: 80,
            render: (status) => status === 1 ? <Tag color="green">上架</Tag> : <Tag color="orange">下架</Tag>
        },
        {
            title: '操作', width: 180,
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleToggleProductStatus(record)}>
                        {record.status === 1 ? '下架' : '上架'}
                    </Button>
                    <Popconfirm title="确定删除该商品？" onConfirm={() => handleDeleteProduct(record.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const handleViewProducts = (shop: Shop) => {
        setCurrentShop(shop);
        setProducts(mockProducts); // 实际应从API获取
        setProductDrawerOpen(true);
    };

    const handleDeleteShop = (id: number) => {
        setShops(shops.filter(s => s.id !== id));
        message.success('店铺已删除');
    };

    const handleAddShop = () => {
        shopForm.validateFields().then(values => {
            const newShop: Shop = {
                id: shops.length + 1,
                ...values,
                status: 1,
                productCount: 0,
            };
            setShops([...shops, newShop]);
            setShopModalOpen(false);
            shopForm.resetFields();
            message.success('店铺已添加');
        });
    };

    const handleToggleProductStatus = (product: Product) => {
        setProducts(products.map(p =>
            p.id === product.id ? { ...p, status: p.status === 1 ? 0 : 1 } : p
        ));
        message.success(product.status === 1 ? '商品已下架' : '商品已上架');
    };

    const handleDeleteProduct = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
        message.success('商品已删除');
    };

    const handleAddProduct = () => {
        productForm.validateFields().then(values => {
            const newProduct: Product = {
                id: products.length + 1,
                ...values,
                status: 1,
                image: '/uploads/default.jpg',
            };
            setProducts([...products, newProduct]);
            setProductModalOpen(false);
            productForm.resetFields();
            message.success('商品已添加');
        });
    };

    return (
        <>
            <div style={{
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(167, 139, 250, 0.05))',
                borderRadius: 12,
                border: '1px solid rgba(139, 92, 246, 0.1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 42,
                        height: 42,
                        background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    }}>
                        <span style={{ fontSize: 20 }}>🏪</span>
                    </div>
                    <h2 style={{
                        margin: 0,
                        color: '#4C1D95',
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 20,
                    }}>
                        店铺管理
                    </h2>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShopModalOpen(true)}
                    style={{
                        height: 40,
                        paddingLeft: 20,
                        paddingRight: 20,
                        borderRadius: 8,
                        fontWeight: 500,
                    }}
                >
                    新增店铺
                </Button>
            </div>
            <Card style={{ border: 'none' }}>
                <Table columns={shopColumns} dataSource={shops} rowKey="id" />
            </Card>

            {/* 新增店铺弹窗 */}
            <Modal
                title="新增店铺"
                open={shopModalOpen}
                onOk={handleAddShop}
                onCancel={() => setShopModalOpen(false)}
            >
                <Form form={shopForm} layout="vertical">
                    <Form.Item name="name" label="店铺名称" rules={[{ required: true }]}>
                        <Input placeholder="请输入店铺名称" />
                    </Form.Item>
                    <Form.Item name="description" label="店铺简介">
                        <TextArea rows={3} placeholder="请输入店铺简介" />
                    </Form.Item>
                    <Form.Item name="logo" label="店铺Logo">
                        <Dragger>
                            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                            <p className="ant-upload-text">点击或拖拽上传Logo</p>
                        </Dragger>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 商品管理抽屉 */}
            <Drawer
                title={`${currentShop?.name || ''} - 商品管理`}
                width={800}
                open={productDrawerOpen}
                onClose={() => setProductDrawerOpen(false)}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setProductModalOpen(true)}>上架新商品</Button>}
            >
                <Table columns={productColumns} dataSource={products} rowKey="id" size="small" />
            </Drawer>

            {/* 新增商品弹窗 */}
            <Modal
                title="上架新商品"
                open={productModalOpen}
                onOk={handleAddProduct}
                onCancel={() => setProductModalOpen(false)}
                width={600}
            >
                <Form form={productForm} layout="vertical">
                    <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
                        <Input placeholder="请输入商品名称" />
                    </Form.Item>
                    <Form.Item name="price" label="商品价格" rules={[{ required: true }]}>
                        <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入价格" />
                    </Form.Item>
                    <Form.Item name="stock" label="库存数量" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存" />
                    </Form.Item>
                    <Form.Item name="category" label="商品分类">
                        <Select placeholder="选择分类">
                            <Select.Option value="food">特色美食</Select.Option>
                            <Select.Option value="souvenir">文创纪念</Select.Option>
                            <Select.Option value="wine">贺兰山葡萄酒</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="商品描述">
                        <TextArea rows={3} placeholder="请输入商品描述" />
                    </Form.Item>
                    <Form.Item name="images" label="商品图片">
                        <Dragger>
                            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                            <p className="ant-upload-text">点击或拖拽上传商品图片</p>
                            <p className="ant-upload-hint">支持多张图片上传</p>
                        </Dragger>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Shops;
