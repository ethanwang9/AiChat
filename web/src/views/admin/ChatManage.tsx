import {FC} from "react";
import {Button, Table, TableProps, Tabs} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

const { TabPane } = Tabs;

// 对话 Tab 接口
interface ChatDataType {
    key: string;
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
    key: string;
    id: string;
    uid: number;
    aid: number;
    question: string;
    answer: string;
    created_at: string;
}

// 擂台 Tab 接口
interface PKDataType {
    key: string;
    id: string;
    uid: number;
    mid1: number;
    mid2: number;
    question: string;
    answer1: string;
    answer2: string;
    created_at: string;
}

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
    },
    {
        title: '问题',
        dataIndex: 'question',
        key: 'question',
    },
    {
        title: '回答',
        dataIndex: 'answer',
        key: 'answer',
        ellipsis: true,
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
            <Button type="text" danger icon={<DeleteOutlined/>}/>
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
    },
    {
        title: '回答',
        dataIndex: 'answer',
        key: 'answer',
        ellipsis: true,
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
            <Button type="text" danger icon={<DeleteOutlined/>}/>
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
            <Button type="text" danger icon={<DeleteOutlined/>}/>
        ),
    },
];

// 示例数据 - 对话
const chatData: ChatDataType[] = [
    {
        key: '1',
        id: 'CHAT_000001',
        uid: 324,
        group_id: 'GROUP_001',
        title: '代码质量讨论',
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '2',
        id: 'CHAT_000002',
        uid: 749,
        group_id: 'GROUP_002',
        title: '代码质量讨论',
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '3',
        id: 'CHAT_000003',
        uid: 74,
        group_id: 'GROUP_003',
        title: '代码质量讨论',
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '4',
        id: 'CHAT_000004',
        uid: 999,
        group_id: 'GROUP_004',
        title: '代码质量讨论',
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '5',
        id: 'CHAT_000005',
        uid: 937,
        group_id: 'GROUP_005',
        title: '代码质量讨论',
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
];

// 示例数据 - 智能体
const agentData: AgentDataType[] = [
    {
        key: '1',
        id: 'CHAT_000001',
        uid: 613,
        aid: 389,
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '2',
        id: 'CHAT_000002',
        uid: 113,
        aid: 517,
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '3',
        id: 'CHAT_000003',
        uid: 817,
        aid: 149,
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '4',
        id: 'CHAT_000004',
        uid: 323,
        aid: 863,
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '5',
        id: 'CHAT_000005',
        uid: 989,
        aid: 285,
        question: '如何提高代码质量?',
        answer: '建议采用代码审查和自动化测试...',
        created_at: '2024-03-15 14:30',
    },
];

// 示例数据 - 擂台
const pkData: PKDataType[] = [
    {
        key: '1',
        id: 'CHAT_000001',
        uid: 54,
        mid1: 4,
        mid2: 2,
        question: '如何提高代码质量?',
        answer1: 'GPT-4: 建议采用代码审查和自动化测试...',
        answer2: 'Claude-2: 首先确保有良好的测试覆盖率...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '2',
        id: 'CHAT_000002',
        uid: 401,
        mid1: 4,
        mid2: 2,
        question: '如何提高代码质量?',
        answer1: 'GPT-4: 建议采用代码审查和自动化测试...',
        answer2: 'Claude-2: 首先确保有良好的测试覆盖率...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '3',
        id: 'CHAT_000003',
        uid: 239,
        mid1: 4,
        mid2: 2,
        question: '如何提高代码质量?',
        answer1: 'GPT-4: 建议采用代码审查和自动化测试...',
        answer2: 'Claude-2: 首先确保有良好的测试覆盖率...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '4',
        id: 'CHAT_000004',
        uid: 264,
        mid1: 4,
        mid2: 2,
        question: '如何提高代码质量?',
        answer1: 'GPT-4: 建议采用代码审查和自动化测试...',
        answer2: 'Claude-2: 首先确保有良好的测试覆盖率...',
        created_at: '2024-03-15 14:30',
    },
    {
        key: '5',
        id: 'CHAT_000005',
        uid: 535,
        mid1: 4,
        mid2: 2,
        question: '如何提高代码质量?',
        answer1: 'GPT-4: 建议采用代码审查和自动化测试...',
        answer2: 'Claude-2: 首先确保有良好的测试覆盖率...',
        created_at: '2024-03-15 14:30',
    },
];

const ChatManage: FC = () => {
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">对话管理</p>
            <Tabs defaultActiveKey="chat">
                <TabPane tab="对话" key="chat">
                    <Table<ChatDataType>
                        sticky
                        columns={chatColumns}
                        dataSource={chatData}
                        pagination={{
                            position: ["bottomCenter"],
                            current: 1,
                            pageSize: 10,
                            total: 100,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                        }}
                    />
                </TabPane>
                <TabPane tab="智能体" key="agent">
                    <Table<AgentDataType>
                        sticky
                        columns={agentColumns}
                        dataSource={agentData}
                        pagination={{
                            position: ["bottomCenter"],
                            current: 1,
                            pageSize: 10,
                            total: 100,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                        }}
                    />
                </TabPane>
                <TabPane tab="擂台" key="pk">
                    <Table<PKDataType>
                        sticky
                        columns={pkColumns}
                        dataSource={pkData}
                        pagination={{
                            position: ["bottomCenter"],
                            current: 1,
                            pageSize: 10,
                            total: 100,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                        }}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ChatManage;
