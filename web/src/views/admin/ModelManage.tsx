import {FC} from "react";
import {Button, Table, Tabs, Space, Tag} from "antd";
import type {TableProps} from "antd";
import {EditOutlined, DeleteOutlined} from "@ant-design/icons";

// 更新接口以匹配数据库字段
interface VendorData {
    id: number;
    name: string;
    url: string;
    key: string;
    money: number;
    created_at: string;
}

interface ModelData {
    id: number;
    cid: number;
    name: string;
    category: string[]; // 更改为字符串数组，支持多个分类标签
    status: "use" | "stop";
    created_at: string;
    channel_name?: string; // 关联通道名称，用于显示
}

// 定义标签颜色映射
const categoryColorMap: Record<string, string> = {
    "深度思考": "blue",
    "对话": "volcano"
};

const {TabPane} = Tabs;

const ModelManage: FC = () => {
    // 模拟供应商数据
    const vendorData: VendorData[] = [
        {
            id: 1,
            name: "DeepSeek",
            url: "https://api.deepseek.com/v1",
            key: "sk-fb68cd937b19423280005f36c69e32ec",
            money: 20.00,
            created_at: "2025-05-01 22:25:39",
        },
    ];

    // 模拟模型数据
    const modelData: ModelData[] = [
        {
            id: 1,
            cid: 1,
            name: "deepseek-chat",
            category: ["对话"],
            status: "use",
            created_at: "2025-05-01 22:25:39",
            channel_name: "DeepSeek",
        },
        {
            id: 2,
            cid: 1,
            name: "Claude-2",
            category: ["深度思考", "对话", "深度思考", "对话", "深度思考", "对话"],
            status: "use",
            created_at: "2024-03-15 14:30",
            channel_name: "Anthropic",
        },
        {
            id: 3,
            cid: 3,
            name: "Gemini Pro",
            category: ["深度思考", "对话"],
            status: "stop",
            created_at: "2024-03-15 14:30",
            channel_name: "Google",
        },
        {
            id: 4,
            cid: 4,
            name: "LLAMA-2",
            category: ["深度思考", "对话"],
            status: "use",
            created_at: "2024-03-15 14:30",
            channel_name: "Microsoft",
        },
        {
            id: 5,
            cid: 1,
            name: "GPT-3.5",
            category: ["深度思考", "对话"],
            status: "stop",
            created_at: "2024-03-15 14:30",
            channel_name: "OpenAI",
        },
    ];

    // 供应商表格列配置
    const vendorColumns: TableProps<VendorData>["columns"] = [
        {
            title: "通道 ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "供应商名称",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "API 地址",
            dataIndex: "url",
            key: "url",
        },
        {
            title: "密钥",
            dataIndex: "key",
            key: "key",
        },
        {
            title: "余额",
            dataIndex: "money",
            key: "money",
            render: (money: number) => `￥${money.toFixed(2)}`,
        },
        {
            title: "创建时间",
            dataIndex: "created_at",
            key: "created_at",
        },
        {
            title: "操作",
            key: "action",
            render: () => (
                <Space>
                    <Button type="text" icon={<EditOutlined/>}/>
                    <Button type="text" danger icon={<DeleteOutlined/>}/>
                </Space>
            ),
        },
    ];

    // 模型表格列配置
    const modelColumns: TableProps<ModelData>["columns"] = [
        {
            title: "模型 ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "通道 ID",
            dataIndex: "cid",
            key: "cid",
        },
        {
            title: "通道名称",
            dataIndex: "channel_name",
            key: "channel_name",
        },
        {
            title: "模型名称",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "分类",
            dataIndex: "category",
            key: "category",
            render: (categories: string[]) => (
                <Space wrap>
                    {categories.map((category) => (
                        <Tag color={categoryColorMap[category] || "default"}>{category}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const color = status === "use" ? "success" : "error";
                const text = status === "use" ? "生效" : "停用";

                return (
                    <Tag color={color} className="px-2 py-1">
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: "创建时间",
            dataIndex: "created_at",
            key: "created_at",
        },
        {
            title: "操作",
            key: "action",
            render: () => (
                <Space>
                    <Button type="text" icon={<EditOutlined/>}/>
                    <Button type="text" danger icon={<DeleteOutlined/>}/>
                </Space>
            ),
        },
    ];

    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-x-hidden overflow-y-auto gap-4">
            <h1 className="text-2xl font-bold">模型管理</h1>
            <Tabs defaultActiveKey="channel">
                <TabPane tab="通道管理" key="channel">
                    <div className="flex flex-col gap-4">
                        <Button className="w-25" type="primary">添加供应商</Button>
                        <Table
                            columns={vendorColumns}
                            dataSource={vendorData}
                            rowKey="id"
                            pagination={{
                                position: ["bottomCenter"],
                                current: 1,
                                pageSize: 10,
                                total: 1,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                            }}
                        />
                    </div>
                </TabPane>
                <TabPane tab="模型管理" key="model">
                    <div className="flex flex-col gap-4">
                        <Button className="w-25" type="primary">添加模型</Button>
                        <Table
                            columns={modelColumns}
                            dataSource={modelData}
                            rowKey="id"
                            pagination={{
                                position: ["bottomCenter"],
                                current: 1,
                                pageSize: 10,
                                total: 1,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                            }}
                        />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ModelManage;
