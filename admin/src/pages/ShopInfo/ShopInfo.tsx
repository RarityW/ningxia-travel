import React from 'react';
import { Card, Form, Input, Button, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const ShopInfo: React.FC = () => {
    const uploadProps = {
        name: 'file',
        multiple: false,
        action: 'http://localhost:8080/api/v1/admin/upload',
        onChange(info: any) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} 上传成功.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} 上传失败.`);
            }
        },
        onDrop(e: any) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <Card title="店铺信息设置 (单商户模式)" bordered={false}>
            <Form
                layout="vertical"
                initialValues={{
                    name: '宁夏文旅商城',
                    description: '汇聚宁夏特色，乐享塞上江南',
                    contact: '0951-12345678',
                }}
            >
                <Form.Item label="商城名称" name="name">
                    <Input placeholder="请输入商城名称" />
                </Form.Item>

                <Form.Item label="商城Logo" name="logo">
                    <Dragger {...uploadProps} style={{ padding: '20px 0', background: '#fafafa', border: '1px dashed #d9d9d9' }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: '#40a9ff', fontSize: 48 }} />
                        </p>
                        <p className="ant-upload-text">点击或将图片拖拽到此处上传</p>
                        <p className="ant-upload-hint">支持 JPG/PNG 格式，建议尺寸 200x200</p>
                    </Dragger>
                </Form.Item>

                <Form.Item label="联系电话" name="contact">
                    <Input placeholder="请输入客服联系电话" />
                </Form.Item>

                <Form.Item label="商城简介" name="description">
                    <Input.TextArea rows={4} placeholder="请输入商城简介" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary">保存更改</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ShopInfo;
