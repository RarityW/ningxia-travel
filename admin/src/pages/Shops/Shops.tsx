import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, message, Tag, Modal, Form, Input } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { merchantsAPI } from '../../services/api';
import ImageUpload from '../../components/ImageUpload';

interface Merchant {
    id: number;
    name: string;
    logo?: string;
    cover_image?: string;
    description?: string;
    phone: string;
    address: string;
    status: number;
}

const Shops: React.FC = () => {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        loadMerchants();
    }, []);

    const loadMerchants = async () => {
        setLoading(true);
        try {
            const response = await merchantsAPI.getList();
            if (response.data.code === 200) {
                setMerchants(response.data.data || []);
            }
        } catch (error) {
            message.error('加载店铺列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingMerchant(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record: Merchant) => {
        setEditingMerchant(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await merchantsAPI.delete(id);
            message.success('删除成功');
            loadMerchants();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingMerchant) {
                await merchantsAPI.update(editingMerchant.id, values);
                message.success('更新成功');
            } else {
                await merchantsAPI.create(values);
                message.success('创建成功');
            }
            setModalVisible(false);
            loadMerchants();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        {
            title: '店铺名称',
            dataIndex: 'name',
            render: (name: string, record: Merchant) => (
                <Space>
                    {record.logo && <img src={record.logo} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />}
                    {name}
                </Space>
            )
        },
        { title: '联系电话', dataIndex: 'phone' },
        { title: '地址', dataIndex: 'address', ellipsis: true },
        {
            title: '状态', dataIndex: 'status', width: 100,
            render: (status: number) => {
                const colors = { 0: 'orange', 1: 'green', 2: 'red' };
                const texts = { 0: '待审核', 1: '正常', 2: '驳回' };
                return <Tag color={(colors as any)[status]}>{(texts as any)[status] || '未知'}</Tag>;
            }
        },
        {
            title: '操作', width: 250,
            render: (_: any, record: Merchant) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/shops/${record.id}/products`)}
                    >
                        管理商品
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: '确认删除',
                                content: '确定要删除这个店铺吗？',
                                onOk: () => handleDelete(record.id),
                            });
                        }}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="shops-page">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>店铺管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    创建店铺
                </Button>
            </div>
            <Card>
                <Table
                    columns={columns}
                    dataSource={merchants}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingMerchant ? '编辑店铺' : '创建店铺'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="店铺名称" rules={[{ required: true, message: '请输入店铺名称' }]}>
                        <Input placeholder="请输入店铺名称" />
                    </Form.Item>

                    <Form.Item name="logo" label="店铺Logo">
                        <ImageUpload maxSize={30} />
                    </Form.Item>

                    <Form.Item name="cover_image" label="封面图">
                        <ImageUpload maxSize={30} />
                    </Form.Item>

                    <Form.Item name="description" label="店铺描述">
                        <Input.TextArea rows={4} placeholder="请输入店铺描述" />
                    </Form.Item>

                    <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                        <Input placeholder="请输入联系电话" />
                    </Form.Item>

                    <Form.Item name="address" label="地址">
                        <Input placeholder="请输入地址" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Shops;
