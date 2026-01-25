import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

interface ImageUploadProps {
    value?: string;
    onChange?: (url: string) => void;
    maxSize?: number; // MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, maxSize = 30 }) => {
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        action: 'http://localhost:8080/api/v1/admin/upload', // Match backend provided in api.ts
        withCredentials: true,
        headers: {
            // Authorization header removed as we use HttpOnly cookies for admin auth
        },
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} 上传成功`);
                if (info.file.response && info.file.response.data && info.file.response.data.url) {
                    onChange?.('http://localhost:8080' + info.file.response.data.url);
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} 上传失败.`);
            }
        },
        beforeUpload(file) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
            if (!isJpgOrPng) {
                message.error('只支持 JPG/PNG/WEBP 格式!');
            }
            const isLtSize = file.size / 1024 / 1024 < maxSize;
            if (!isLtSize) {
                message.error(`图片大小不能超过 ${maxSize}MB!`);
            }
            return isJpgOrPng && isLtSize;
        },
        showUploadList: false, // We usually show custom preview or rely on status
    };

    return (
        <div>
            <Dragger {...props} style={{ padding: 20 }}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽上传</p>
                <p className="ant-upload-hint">支持 JPG/PNG/WEBP，大小限制 {maxSize}MB</p>
            </Dragger>
            {value && (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                    <img src={value} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
