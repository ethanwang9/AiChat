import {FC} from "react";
import {Button, Space, Table, TableProps} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";

interface DataType {
    id: number;
    name: string;
    description: string;
    prompt: string;
    temperature: number;
    avatar: string;
    category: string;
}

const columns: TableProps<DataType>['columns'] = [
    {
        title: '智能体ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: '头像',
        dataIndex: 'avatar',
        key: 'avatar',
        render: () => {
            return <img className="w-12 h-12" src="/src/assets/avatar/1.jpg" alt="智能体头像"/>
        }
    },
    {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '介绍',
        dataIndex: 'prompt',
        key: 'prompt',
    },
    {
        title: '提示词',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: '温度',
        dataIndex: 'temperature',
        key: 'temperature',
    },
    {
        title: '类别',
        dataIndex: 'category',
        key: 'category',
    },
    {
        title: '操作',
        key: 'action',
        render: () => (
            <Space>
                <Button type="text" icon={<EditOutlined/>}/>
                <Button type="text" danger icon={<DeleteOutlined/>}/>
            </Space>
        ),
    },
];

const data: DataType[] = Array.from({length: 50}).map((_, index) => {
    return {
        id: index + 1,
        name: `智能体${index + 1}`,
        description: '智能助手',
        prompt: '你是一个有帮助的AI助手',
        temperature: 0.7,
        avatar: 'https://example.com/avatar.png',
        category: '通用',
    }
})

const AgentManage: FC = () => {
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-x-hidden overflow-y-auto gap-4">
            <p className="font-bold text-2xl">智能体</p>
            <Button className="w-40 !py-4" icon={<PlusOutlined/>} color="primary" variant="solid">添加智能体</Button>
            <Table<DataType>
                sticky
                columns={columns}
                dataSource={data}
                pagination={{
                    position: ["bottomCenter"],
                    current: 1,
                    pageSize: 10,
                    total: 100,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                }}
            />

        </div>
    );
};

export default AgentManage;
