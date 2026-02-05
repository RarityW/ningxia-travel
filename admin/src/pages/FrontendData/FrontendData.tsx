import React, { useEffect, useState } from 'react';
import { Card, Tabs, Table, Tag, message, Button, Modal, Form, Input, Select, Upload, Popconfirm } from 'antd';
import { UploadOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { attractionsAPI, foodAPI, assetsAPI } from '../../services/api';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

const FrontendData: React.FC = () => {
    const [attractions, setAttractions] = useState([]);
    const [food, setFood] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [form] = Form.useForm();
    const [previewImage, setPreviewImage] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [attrRes, foodRes, assetRes] = await Promise.all([
                attractionsAPI.getList(),
                foodAPI.getList(),
                assetsAPI.getList()
            ]);
            if (attrRes.data.code === 200) setAttractions(attrRes.data.data || []);
            if (foodRes.data.code === 200) setFood(foodRes.data.data || []);
            // check asset structure usually list is directly in data or in data.list
            const assetList = assetRes.data.list || assetRes.data.data || [];
            if (Array.isArray(assetList)) {
                setAssets(assetList as any);
            } else {
                setAssets([]);
            }
        } catch (error) {
            console.error(error);
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingAsset(null);
        setPreviewImage('');
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: any) => {
        setEditingAsset(record);
        setPreviewImage(record.image_url);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await assetsAPI.delete(id);
            message.success('删除成功');
            loadData();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingAsset) {
                await assetsAPI.update(editingAsset.id, values);
                message.success('更新成功');
            } else {
                await assetsAPI.create(values);
                message.success('创建成功');
            }
            setIsModalVisible(false);
            loadData();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        action: 'http://localhost:8080/api/v1/admin/upload',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} 上传成功.`);
                // Response structure: { code: 200, message: "success", data: { url: "..." } }
                const url = info.file.response?.data?.url;
                if (url) {
                    setPreviewImage(url);
                    form.setFieldsValue({ image_url: url });
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} 上传失败.`);
            }
        },
        beforeUpload(file) {
            const isLt30M = file.size / 1024 / 1024 < 30;
            if (!isLt30M) {
                message.error('图片必须小于 30MB!');
            }
            return isLt30M;
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    // Columns for Recommendation Data
    const recommendColumns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '名称', dataIndex: 'name' },
        {
            title: '封面',
            dataIndex: 'cover_image',
            render: (src: string) => src ? <img src={src} alt="cover" style={{ width: 50, height: 30, objectFit: 'cover' }} /> : '-'
        },
        {
            title: '推荐状态',
            dataIndex: 'recommend',
            render: (rec: boolean) => rec ? <Tag color="green">已推荐</Tag> : <Tag>未推荐</Tag>
        }
    ];

    // Columns for Assets Data
    const assetColumns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '标题', dataIndex: 'title' },
        { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="geekblue">{t}</Tag> },
        {
            title: '图片',
            dataIndex: 'image_url',
            render: (src: string) => src ? <img src={src} alt="asset" style={{ width: 80, height: 40, objectFit: 'cover' }} /> : '-'
        },
        { title: '排序', dataIndex: 'sort_order' },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <span>
                    <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
                    <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger>删除</Button>
                    </Popconfirm>
                </span>
            )
        }
    ];

    const items = [
        {
            key: '1',
            label: '素材管理(Banners)',
            children: (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>添加素材</Button>
                    </div>
                    <Table dataSource={assets} columns={assetColumns} rowKey="id" loading={loading} />
                </>
            )
        },
        {
            key: '2',
            label: '景点数据推荐',
            children: <Table dataSource={attractions} columns={recommendColumns} rowKey="id" loading={loading} />
        },
        {
            key: '3',
            label: '美食数据推荐',
            children: <Table dataSource={food} columns={recommendColumns} rowKey="id" loading={loading} />
        }
    ];

    return (
        <div>
            <h2>前端数据管理</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>
                管理小程序首页Banner、图标以及各类推荐内容。
            </p>
            <Card>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>

            <Modal
                title={editingAsset ? "编辑素材" : "添加素材"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="类型" initialValue="home_banner" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="home_banner">首页Banner</Select.Option>
                            <Select.Option value="home_icon">首页图标</Select.Option>
                            <Select.Option value="market_banner">优惠页Banner</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="图片上传">
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
                            <p className="ant-upload-hint">支持单张图片上传，最大支持 30MB</p>
                        </Dragger>
                        {previewImage && (
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} />
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item name="image_url" label="图片链接 (自动填充)" rules={[{ required: true }]}>
                        <Input placeholder="/images/banner-1.jpg 或 http://..." />
                    </Form.Item>

                    <Form.Item name="link_url" label="跳转链接">
                        <Input placeholder="/pages/..." />
                    </Form.Item>
                    <Form.Item name="sort_order" label="排序" initialValue={0}>
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FrontendData;
