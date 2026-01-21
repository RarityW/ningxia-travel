import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
} from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { usersAPI } from '../../services/api';

const { Option } = Select;

interface User {
  id: number;
  open_id: string;
  nick_name: string;
  avatar: string;
  gender: number;
  phone: string;
  is_active: boolean;
  created_at: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getList();
      if (response.data.code === 200) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      message.error('加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1:
        return '男';
      case 2:
        return '女';
      default:
        return '未知';
    }
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '昵称',
      dataIndex: 'nick_name',
      key: 'nick_name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: number) => getGenderText(gender),
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        isActive ? <Tag color="green">正常</Tag> : <Tag color="red">禁用</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>用户管理</h2>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={selectedUser ? '用户信息' : '编辑用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <Form
            form={form}
            layout="vertical"
            initialValues={selectedUser}
          >
            <Form.Item label="用户ID">
              <span>{selectedUser.id}</span>
            </Form.Item>

            <Form.Item label="OpenID">
              <span>{selectedUser.open_id}</span>
            </Form.Item>

            <Form.Item name="nick_name" label="昵称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="gender" label="性别">
              <Select>
                <Option value={1}>男</Option>
                <Option value={2}>女</Option>
                <Option value={0}>未知</Option>
              </Select>
            </Form.Item>

            <Form.Item name="phone" label="电话">
              <Input />
            </Form.Item>

            <Form.Item name="is_active" label="状态">
              <Select>
                <Option value={true}>正常</Option>
                <Option value={false}>禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item label="注册时间">
              <span>{new Date(selectedUser.created_at).toLocaleString()}</span>
            </Form.Item>

            <Form.Item label="头像">
              {selectedUser.avatar && (
                <img
                  src={selectedUser.avatar}
                  alt="avatar"
                  style={{ width: 60, height: 60, borderRadius: '50%' }}
                />
              )}
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Users;