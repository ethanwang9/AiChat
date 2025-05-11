import { FC, useState } from "react";
import { Button, Space, Table, TableProps, Modal, message } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { DeleteAdminHistory, DeleteAdminHistoryID, GetAdminHistoryGroupID, GetAdminHistoryPage } from "@/apis/admin.ts";
import { useMount, useRequest } from "ahooks";
import { HTTPAdminHistoryGroupInfo } from "@/types/http/admin";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import {formatDate} from "@/utils/tools.ts";

interface DataType {
    id: string;
    group_id: string;
    title: string;
    created_at: string;
}

// 聊天消息组件
const ChatMessage: FC<{ message: HTTPAdminHistoryGroupInfo }> = ({ message }) => {
    return (
        <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-end">
                <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                    <MarkdownRenderer content={message.question} />
                </div>
            </div>
            <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <MarkdownRenderer content={message.answer} />
                </div>
            </div>
        </div>
    );
};

const History: FC = () => {
    // 初始化
    const [historyData, setHistoryData] = useState<DataType[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Modal状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<HTTPAdminHistoryGroupInfo[]>([]);
    const [currentTitle, setCurrentTitle] = useState("");

    // 获取历史记录分页数据
    const { run: getHistoryPage, loading: getHistoryPageLoading } = useRequest(
        (limit: number, page: number) => GetAdminHistoryPage(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const tableData = response.history.map(item => ({
                    group_id: item.group_id,
                    title: item.title,
                    created_at: formatDate(item.created_at),
                    id: item.id,
                }));
                setHistoryData(tableData);
                setPagination(prev => ({ ...prev, total: response.total }));
            },
        }
    );

    // 删除全部历史记录
    const { run: deleteAllHistory } = useRequest(DeleteAdminHistory,
        {
            manual: true,
            onSuccess: () => {
                message.success({
                    content: "删除成功",
                });
                // 刷新数据
                getHistoryPage(pagination.pageSize, pagination.current);
            },
        }
    );

    // 删除指定历史记录
    const { run: deleteHistoryID } = useRequest(
        (id: string) => DeleteAdminHistoryID(id),
        {
            manual: true,
            onSuccess: () => {
                message.success({
                    content: "删除成功",
                });
                // 刷新数据
                getHistoryPage(pagination.pageSize, pagination.current);
            },
        }
    );

    // 获取历史记录指定数据
    const { run: getHistoryGID } = useRequest(
        (group_id: string) => GetAdminHistoryGroupID(group_id),
        {
            manual: true,
            onSuccess: (data) => {
                setChatMessages(data);
                if (data.length > 0) {
                    setCurrentTitle(data[0].title);
                }
            },
        }
    );

    // 处理查看历史记录
    const handleViewHistory = (group_id: string) => {
        setIsModalOpen(true);
        getHistoryGID(group_id);
    };

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
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewHistory(record.group_id)} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
                        Modal.confirm({
                            title: '危险操作',
                            content: '您确定要删除话题吗？',
                            okText: '删除',
                            okType: 'danger',
                            cancelText: '取消',
                            onOk: () => {
                                deleteHistoryID(record.group_id)
                                getHistoryPage(pagination.pageSize, pagination.current);
                            },
                        });
                    }} />
                </Space>
            ),
        },
    ];

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
            <Button
                className="w-40 !py-4"
                icon={<DeleteOutlined />}
                color="danger"
                variant="solid"
                onClick={() => {
                    Modal.confirm({
                        title: '危险操作',
                        content: '您确定要清除所有历史记录吗？',
                        okText: '删除',
                        okType: 'danger',
                        cancelText: '取消',
                        onOk: () => {
                            deleteAllHistory();
                            getHistoryPage(pagination.pageSize, pagination.current);
                        },
                    });
                }}
            >
                清除所有记录
            </Button>
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
            <Modal
                title={currentTitle}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
            >
                <div className="max-h-[60vh] overflow-y-auto">
                    {chatMessages.map((message, index) => (
                        <ChatMessage key={index} message={message} />
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default History;
