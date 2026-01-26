import React, { useState, useEffect } from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

interface MultiImageUploadProps {
    value?: string[]; // JSON string of array
    onChange?: (value: string[]) => void;
    maxCount?: number;
    maxSize?: number; // MB
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
    value = [],
    onChange,
    maxCount = 9,
    maxSize = 20
}) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        // Initial value handling
        if (value && Array.isArray(value)) {
            // Check if fileList already matches value to prevent infinite loop
            const currentUrls = fileList.map(f => f.url).filter(Boolean);
            const valueUrls = value.filter(Boolean);
            const isMatch = currentUrls.length === valueUrls.length &&
                currentUrls.every((url, index) => url === valueUrls[index]);

            if (!isMatch) {
                setFileList(
                    value.map((url, index) => ({
                        uid: `-${index}`,
                        name: `image-${index}`,
                        status: 'done',
                        url: url,
                    }))
                );
            }
        }
    }, [JSON.stringify(value)]);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            // should not happen for done files
            return;
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        // Update local state
        setFileList(newFileList);

        // Filter uploaded successfully files and trigger onChange
        // Only trigger onChange if operation is complete (done or remove)
        const allDone = newFileList.every(f => f.status === 'done' || f.originFileObj);

        // Extract urls
        const urls = newFileList
            .filter(file => file.status === 'done' && file.response)
            .map(file => {
                if (file.response?.data?.url) {
                    return 'http://localhost:8080' + file.response.data.url;
                }
                return '';
            })
            .concat(
                newFileList
                    .filter(file => file.status === 'done' && !file.response && file.url) // existing files
                    .map(file => file.url!)
            )
            .filter(url => url !== ''); // filter empty

        if (newFileList.length === urls.length || newFileList.some(f => f.status === 'removed')) {
            onChange?.(urls);
        }
    };

    // Custom upload implementation to match ImageUpload.tsx logic but for multiple files UI
    const props: UploadProps = {
        name: 'file',
        multiple: true,
        action: 'http://localhost:8080/api/v1/admin/upload',
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        listType: 'picture-card',
        fileList: fileList,
        onPreview: handlePreview,
        onChange: handleChange,
        beforeUpload(file) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
            if (!isJpgOrPng) {
                message.error('只支持 JPG/PNG/WEBP 格式!');
                return Upload.LIST_IGNORE;
            }
            const isLtSize = file.size / 1024 / 1024 < maxSize;
            if (!isLtSize) {
                message.error(`图片大小不能超过 ${maxSize}MB!`);
                return Upload.LIST_IGNORE;
            }
            return true;
        },
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
        </div>
    );

    return (
        <>
            <Upload {...props}>
                {fileList.length >= maxCount ? null : uploadButton}
            </Upload>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default MultiImageUpload;
