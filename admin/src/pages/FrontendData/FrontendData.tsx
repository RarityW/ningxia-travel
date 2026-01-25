import React, { useEffect, useState } from 'react';
import { Card, Tabs, Table, Tag, message } from 'antd';
import { attractionsAPI, foodAPI } from '../../services/api';

const FrontendData: React.FC = () => {
    const [attractions, setAttractions] = useState([]);
    const [food, setFood] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [attrRes, foodRes] = await Promise.all([
                attractionsAPI.getList(),
                foodAPI.getList()
            ]);
            if (attrRes.data.code === 200) setAttractions(attrRes.data.data || []);
            if (foodRes.data.code === 200) setFood(foodRes.data.data || []);
        } catch (error) {
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '名称', dataIndex: 'name' },
        {
            title: '推荐状态',
            dataIndex: 'recommend',
            render: (rec: boolean) => rec ? <Tag color="green">已推荐</Tag> : <Tag>未推荐</Tag>
        },
        // More columns can be added
    ];

    const items = [
        {
            key: '1',
            label: '景点数据',
            children: <Table dataSource={attractions} columns={columns} rowKey="id" loading={loading} />
        },
        {
            key: '2',
            label: '美食数据',
            children: <Table dataSource={food} columns={columns} rowKey="id" loading={loading} />
        }
    ];

    return (
        <div>
            <h2>前端数据管理</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>
                管理前端展示的核心数据，包括景点、美食等的推荐状态。
                此处展示的数据将直接同步至小程序前端。
            </p>
            <Card>
                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </div>
    );
};

export default FrontendData;
