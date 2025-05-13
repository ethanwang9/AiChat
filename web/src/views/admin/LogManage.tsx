import { FC, useState } from "react";
import { Button, message, Modal, Space, Table, TableProps } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useMount, useRequest } from "ahooks";
import { GetAdminLog, DeleteAdminLog } from "@/apis/admin.ts";
import { formatDate } from "@/utils/tools.ts";
import { HTTPAdminManagerLogGet } from "@/types/http/admin";

interface DataType {
    id: string;
    operate: string;
    uid: number;
    job: string;
    content: string;
    createTime: string;
}

// 解析Token统计数据
const parseTokenStats = (content: string): string => {
    const tokenData = JSON.parse(content);
    if (tokenData && tokenData.total_tokens) {
        return `花费token ${tokenData.total_tokens}`;
    }
    return content;
};



const LogManage: FC = () => {
    // 初始化
    const [logData, setLogData] = useState<DataType[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 表格字段
    const columns: TableProps<DataType>['columns'] = [
        {
            title: '日志ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '操作类型',
            dataIndex: 'operate',
            key: 'operate',
        },
        {
            title: '用户ID',
            dataIndex: 'uid',
            key: 'uid',
        },
        {
            title: '任务',
            dataIndex: 'job',
            key: 'job',
        },
        {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({
                        title: '微信操作',
                        content: '确定删除该条日志吗？',
                        okText: '确定',
                        cancelText: '取消',
                        onOk: () => {
                            deleteLog(record.id);
                        },
                    })} />
                </Space>
            ),
        },
    ];

    // 获取记录分页数据
    const { run: getLogPage, loading: getLogPageLoading } = useRequest(
        (limit: number, page: number) => GetAdminLog(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminManagerLogGet;

                const tableData = data.log.map(item => {
                    // 处理特定类型的日志内容
                    let content = item.content;
                    if (item.operate === "系统任务" && item.job === "Token统计") {
                        content = parseTokenStats(item.content);
                    }

                    return {
                        id: item.id,
                        operate: item.operate,
                        uid: item.uid,
                        job: item.job,
                        content: content,
                        createTime: formatDate(item.created_at),
                    };
                });

                setLogData(tableData);
                setPagination(prev => ({ ...prev, total: data.total }));
            },
        }
    );

    // 删除记录
    const { run: deleteLog } = useRequest(
        (id: string) => DeleteAdminLog(id),
        {
            manual: true,
            onSuccess: () => {
                message.success("删除成功");
                getLogPage(pagination.pageSize, pagination.current);
            },
        }
    );

    // 处理分页变化
    const handlePaginationChange = (page: number, pageSize: number) => {
        setPagination(prev => ({ ...prev, current: page, pageSize }));
        getLogPage(pageSize, page);
    };

    // 生命周期 - 挂载
    useMount(() => {
        // 初始化加载第一页数据，页码从1开始
        getLogPage(pagination.pageSize, pagination.current);
    });

    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">日志管理</p>
            <Table<DataType>
                sticky
                loading={getLogPageLoading}
                columns={columns}
                dataSource={logData}
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

export default LogManage;