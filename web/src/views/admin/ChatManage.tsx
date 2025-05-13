import { FC, useState } from "react";
import { Button, Space, Table, TableProps, Tabs, message, Modal, Popconfirm } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useMount, useRequest } from "ahooks";
import { 
    GetAdminChatAgent, 
    GetAdminChatHistory, 
    GetAdminChatPk,
    DeleteAdminChatHistory,
    DeleteAdminChatAgent,
    DeleteAdminChatPk
} from "@/apis/admin";
import { HTTPAdminChatAgentGet, HTTPAdminChatHistoryGet, HTTPAdminChatPkGet } from "@/types/http/admin";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";

const { TabPane } = Tabs;

// 对话 Tab 接口
interface ChatDataType {
    id: string;
    uid: number;
    group_id: string;
    title: string;
    question: string;
    answer: string;
    created_at: string;
}

// 智能体 Tab 接口
interface AgentDataType {
    id: string;
    uid: number;
    aid: number;
    question: string;
    answer: string;
    created_at: string;
}

// 擂台 Tab 接口
interface PKDataType {
    id: string;
    uid: number;
    mid1: number;
    mid2: number;
    question: string;
    answer1: string;
    answer2: string;
    created_at: string;
}

const ChatManage: FC = () => {
    // 当前激活的tab
    const [activeTab, setActiveTab] = useState<string>("chat");
    
    // 对话数据状态
    const [chatData, setChatData] = useState<ChatDataType[]>([]);
    const [chatPagination, setChatPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    
    // 智能体数据状态
    const [agentData, setAgentData] = useState<AgentDataType[]>([]);
    const [agentPagination, setAgentPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    
    // 擂台数据状态
    const [pkData, setPkData] = useState<PKDataType[]>([]);
    const [pkPagination, setPkPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    
    // 对话详情模态框状态
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentChat, setCurrentChat] = useState<ChatDataType | null>(null);
    
    // 智能体对话详情模态框状态
    const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);
    const [currentAgentChat, setCurrentAgentChat] = useState<AgentDataType | null>(null);
    
    // 擂台对话详情模态框状态
    const [isPkModalVisible, setIsPkModalVisible] = useState(false);
    const [currentPk, setCurrentPk] = useState<PKDataType | null>(null);

    // 获取对话历史数据
    const { run: fetchChatHistory, loading: chatLoading } = useRequest(
        (limit: number, page: number) => GetAdminChatHistory(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminChatHistoryGet;
                setChatData(data.history);
                setChatPagination(prev => ({ ...prev, total: data.total }));
            },
            onError: () => {
                message.error("获取对话历史数据失败");
            }
        }
    );
    
    // 获取智能体对话数据
    const { run: fetchAgentHistory, loading: agentLoading } = useRequest(
        (limit: number, page: number) => GetAdminChatAgent(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminChatAgentGet;
                const formattedData = data.agent.map(item => ({
                    id: item.id,
                    uid: item.uid,
                    aid: item.aid || 0,
                    question: item.question || "",
                    answer: item.answer || "",
                    created_at: item.created_at
                }));
                setAgentData(formattedData);
                setAgentPagination(prev => ({ ...prev, total: data.total }));
            },
            onError: () => {
                message.error("获取智能体对话数据失败");
            }
        }
    );
    
    // 获取擂台对话数据
    const { run: fetchPkHistory, loading: pkLoading } = useRequest(
        (limit: number, page: number) => GetAdminChatPk(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminChatPkGet;
                setPkData(data.pk);
                setPkPagination(prev => ({ ...prev, total: data.total }));
            },
            onError: () => {
                message.error("获取擂台对话数据失败");
            }
        }
    );

    // 删除聊天历史记录
    const { run: deleteChatHistory, loading: deleteChatLoading } = useRequest(
        (id: string) => DeleteAdminChatHistory(id),
        {
            manual: true,
            onSuccess: () => {
                message.success("删除成功");
                fetchChatHistory(chatPagination.pageSize, chatPagination.current);
            },
            onError: () => {
                message.error("删除失败");
            }
        }
    );

    // 删除智能体对话记录
    const { run: deleteAgentChat, loading: deleteAgentLoading } = useRequest(
        (id: string) => DeleteAdminChatAgent(id),
        {
            manual: true,
            onSuccess: () => {
                message.success("删除成功");
                fetchAgentHistory(agentPagination.pageSize, agentPagination.current);
            },
            onError: () => {
                message.error("删除失败");
            }
        }
    );

    // 删除擂台对话记录
    const { run: deletePkChat, loading: deletePkLoading } = useRequest(
        (id: string) => DeleteAdminChatPk(id),
        {
            manual: true,
            onSuccess: () => {
                message.success("删除成功");
                fetchPkHistory(pkPagination.pageSize, pkPagination.current);
            },
            onError: () => {
                message.error("删除失败");
            }
        }
    );

    // 处理对话分页变化
    const handleChatPaginationChange = (page: number, pageSize: number) => {
        setChatPagination(prev => ({ ...prev, current: page, pageSize }));
        fetchChatHistory(pageSize, page);
    };
    
    // 处理智能体分页变化
    const handleAgentPaginationChange = (page: number, pageSize: number) => {
        setAgentPagination(prev => ({ ...prev, current: page, pageSize }));
        fetchAgentHistory(pageSize, page);
    };
    
    // 处理擂台分页变化
    const handlePkPaginationChange = (page: number, pageSize: number) => {
        setPkPagination(prev => ({ ...prev, current: page, pageSize }));
        fetchPkHistory(pageSize, page);
    };

    // 查看对话详情
    const handleViewChat = (chat: ChatDataType) => {
        setCurrentChat(chat);
        setIsModalVisible(true);
    };
    
    // 查看智能体对话详情
    const handleViewAgentChat = (chat: AgentDataType) => {
        setCurrentAgentChat(chat);
        setIsAgentModalVisible(true);
    };
    
    // 查看擂台对话详情
    const handleViewPk = (pk: PKDataType) => {
        setCurrentPk(pk);
        setIsPkModalVisible(true);
    };

    // 删除对话记录
    const handleDeleteChat = (id: string) => {
        deleteChatHistory(id);
    };

    // 删除智能体对话记录
    const handleDeleteAgentChat = (id: string) => {
        deleteAgentChat(id);
    };

    // 删除擂台对话记录
    const handleDeletePkChat = (id: string) => {
        deletePkChat(id);
    };

    // 关闭模态框
    const handleModalClose = () => {
        setIsModalVisible(false);
        setCurrentChat(null);
    };
    
    // 关闭智能体模态框
    const handleAgentModalClose = () => {
        setIsAgentModalVisible(false);
        setCurrentAgentChat(null);
    };
    
    // 关闭擂台模态框
    const handlePkModalClose = () => {
        setIsPkModalVisible(false);
        setCurrentPk(null);
    };

    // 对话 Tab 列定义
    const chatColumns: TableProps<ChatDataType>['columns'] = [
        {
            title: '对话 ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '用户 ID',
            dataIndex: 'uid',
            key: 'uid',
        },
        {
            title: '集合 ID',
            dataIndex: 'group_id',
            key: 'group_id',
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
        },
        {
            title: '问题',
            dataIndex: 'question',
            key: 'question',
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
        },
        {
            title: '回答',
            dataIndex: 'answer',
            key: 'answer',
            ellipsis: true,
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
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
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewChat(record)} />
                    <Popconfirm
                        title="确定删除该记录吗？"
                        onConfirm={() => handleDeleteChat(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="text" danger loading={deleteChatLoading} icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    
    // 智能体 Tab 列定义
    const agentColumns: TableProps<AgentDataType>['columns'] = [
        {
            title: '记录 ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '用户 ID',
            dataIndex: 'uid',
            key: 'uid',
        },
        {
            title: '智能体 ID',
            dataIndex: 'aid',
            key: 'aid',
        },
        {
            title: '问题',
            dataIndex: 'question',
            key: 'question',
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
        },
        {
            title: '回答',
            dataIndex: 'answer',
            key: 'answer',
            ellipsis: true,
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
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
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewAgentChat(record)} />
                    <Popconfirm
                        title="确定删除该记录吗？"
                        onConfirm={() => handleDeleteAgentChat(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="text" danger loading={deleteAgentLoading} icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    
    // 擂台 Tab 列定义
    const pkColumns: TableProps<PKDataType>['columns'] = [
        {
            title: '记录 ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '用户 ID',
            dataIndex: 'uid',
            key: 'uid',
        },
        {
            title: '问题',
            dataIndex: 'question',
            key: 'question',
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
        },
        {
            title: '模型 ID-1',
            dataIndex: 'mid1',
            key: 'mid1',
        },
        {
            title: '回答-1',
            dataIndex: 'answer1',
            key: 'answer1',
            ellipsis: true,
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
        },
        {
            title: '模型 ID-2',
            dataIndex: 'mid2',
            key: 'mid2',
        },
        {
            title: '回答-2',
            dataIndex: 'answer2',
            key: 'answer2',
            ellipsis: true,
            render: (text: string) => {
                return <p className="line-clamp-3 text-wrap">{text}</p>;
            }
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
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewPk(record)} />
                    <Popconfirm
                        title="确定删除该记录吗？"
                        onConfirm={() => handleDeletePkChat(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="text" danger loading={deletePkLoading} icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 根据当前激活的tab加载对应数据
    const loadDataByTab = (tab: string) => {
        switch (tab) {
            case "chat":
                fetchChatHistory(chatPagination.pageSize, chatPagination.current);
                break;
            case "agent":
                fetchAgentHistory(agentPagination.pageSize, agentPagination.current);
                break;
            case "pk":
                fetchPkHistory(pkPagination.pageSize, pkPagination.current);
                break;
        }
    };

    // 处理tab切换
    const handleTabChange = (activeKey: string) => {
        setActiveTab(activeKey);
        loadDataByTab(activeKey);
    };

    // 组件挂载时只加载当前选中tab的数据
    useMount(() => {
        loadDataByTab(activeTab);
    });

    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">对话管理</p>
            <Tabs defaultActiveKey="chat" onChange={handleTabChange}>
                <TabPane tab="对话" key="chat">
                    <Table<ChatDataType>
                        sticky
                        loading={chatLoading}
                        columns={chatColumns}
                        dataSource={chatData}
                        rowKey="id"
                        pagination={{
                            position: ["bottomCenter"],
                            current: chatPagination.current,
                            pageSize: chatPagination.pageSize,
                            total: chatPagination.total,
                            onChange: handleChatPaginationChange,
                            showSizeChanger: false,
                        }}
                    />
                </TabPane>
                <TabPane tab="智能体" key="agent">
                    <Table<AgentDataType>
                        sticky
                        loading={agentLoading}
                        columns={agentColumns}
                        dataSource={agentData}
                        rowKey="id"
                        pagination={{
                            position: ["bottomCenter"],
                            current: agentPagination.current,
                            pageSize: agentPagination.pageSize,
                            total: agentPagination.total,
                            onChange: handleAgentPaginationChange,
                            showSizeChanger: false,
                        }}
                    />
                </TabPane>
                <TabPane tab="擂台" key="pk">
                    <Table<PKDataType>
                        sticky
                        loading={pkLoading}
                        columns={pkColumns}
                        dataSource={pkData}
                        rowKey="id"
                        pagination={{
                            position: ["bottomCenter"],
                            current: pkPagination.current,
                            pageSize: pkPagination.pageSize,
                            total: pkPagination.total,
                            onChange: handlePkPaginationChange,
                            showSizeChanger: false,
                        }}
                    />
                </TabPane>
            </Tabs>

            {/* 对话详情模态框 */}
            <Modal
                title={currentChat?.title || "对话详情"}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {currentChat && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">问题</h3>
                            <div className="bg-blue-50 p-3 rounded-md">
                                <MarkdownRenderer content={currentChat.question} />
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">回答</h3>
                            <div className="bg-green-50 p-3 rounded-md">
                                <MarkdownRenderer content={currentChat.answer} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* 智能体对话详情模态框 */}
            <Modal
                title="智能体对话详情"
                open={isAgentModalVisible}
                onCancel={handleAgentModalClose}
                footer={null}
                width={800}
            >
                {currentAgentChat && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">问题</h3>
                            <div className="bg-blue-50 p-3 rounded-md">
                                <MarkdownRenderer content={currentAgentChat.question} />
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">回答</h3>
                            <div className="bg-green-50 p-3 rounded-md">
                                <MarkdownRenderer content={currentAgentChat.answer} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* 擂台对话详情模态框 */}
            <Modal
                title="擂台对话详情"
                open={isPkModalVisible}
                onCancel={handlePkModalClose}
                footer={null}
                width={800}
            >
                {currentPk && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">问题</h3>
                            <div className="bg-blue-50 p-3 rounded-md">
                                <MarkdownRenderer content={currentPk.question} />
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">模型 1 回答</h3>
                            <div className="bg-green-50 p-3 rounded-md">
                                <MarkdownRenderer content={currentPk.answer1} />
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">模型 2 回答</h3>
                            <div className="bg-amber-50 p-3 rounded-md">
                                <MarkdownRenderer content={currentPk.answer2} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ChatManage;
