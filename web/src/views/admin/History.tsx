import { FC, useState } from "react";
import { Button, Space, Table, TableProps } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { GetAdminHistoryPage } from "@/apis/admin.ts";
import { useMount, useRequest } from "ahooks";
import { HTTPAdminHistoryPage } from "@/types/http/admin";

interface DataType {
    group_id: string;
    title: string;
    created_at: string;
}

const columns: TableProps<DataType>['columns'] = [
    {
        title: '集合ID',
        dataIndex: 'group_id',
        key: 'group_id',
    },
    {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
    },
    {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
    },
    {
        title: '操作',
        key: 'action',
        render: () => (
            <Space>
                <Button type="text" icon={<EyeOutlined />} />
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Space>
        ),
    },
];

const History: FC = () => {
    // 初始化
    const [historyData, setHistoryData] = useState<DataType[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    
    // 获取历史记录分页数据
    const { run: getHistoryPage, loading: getHistoryPageLoading } = useRequest(
        (limit: number, page: number) => GetAdminHistoryPage(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const tableData = response.history.map(item => ({
                    group_id: item.group_id,
                    title: item.title,
                    created_at: item.created_at,
                }));
                setHistoryData(tableData);
                setPagination(prev => ({...prev, total: response.total}));
            },
        }
    );

    // 处理分页变化
    const handlePaginationChange = (page: number, pageSize: number) => {
        setPagination(prev => ({ ...prev, current: page, pageSize }));
        // 直接传递页码作为offset
        getHistoryPage(pageSize, page);
    };

    // 生命周期 - 挂载
    useMount(() => {
        // 初始化加载第一页数据，页码从1开始
        getHistoryPage(pagination.pageSize, pagination.current);
    });
    
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">历史对话记录</p>
            <Button className="w-40 !py-4" icon={<DeleteOutlined />} color="danger" variant="solid">清除所有记录</Button>
            <Table<DataType>
                sticky
                loading={getHistoryPageLoading}
                columns={columns}
                dataSource={historyData}
                rowKey="group_id"
                pagination={{
                    position: ["bottomCenter"],
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                    onChange: handlePaginationChange,
                }}
            />
        </div>
    );
};

export default History;
