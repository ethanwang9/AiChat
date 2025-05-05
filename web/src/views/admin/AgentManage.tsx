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
        render: (value) => {
            return <img className="w-12 h-12" src={value} alt="智能体头像"/>
        }
    },
    {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (value)=>(
            <p className="line-clamp-2">{value}</p>
        ),
    },
    {
        title: '介绍',
        dataIndex: 'description',
        key: 'description',
        render: (value)=>(
            <p className="line-clamp-3">{value}</p>
        ),
    },
    {
        title: '提示词',
        dataIndex: 'prompt',
        key: 'prompt',
        render: (value)=>(
            <p className="line-clamp-3">{value}</p>
        ),
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

const data: DataType[] = [
    {
        id: 1,
        name: "爆炸标题党",
        description: 'Boooom！炸裂的标题诞生！',
        prompt: '扮演角色',
        temperature: 1,
        avatar: '/src/assets/avatar/2.png',
        category: '文本编辑',
    },
    {
        id: 2,
        name: "AI编码助手",
        description: '你好，我是你的 AI 编码助手，我能帮你写代码、写注释、写单元测试，帮你读代码、排查代码问题等。快来考考我吧！',
        prompt: '扮演角色',
        temperature: 1,
        avatar: '/src/assets/avatar/3.png',
        category: '编程开发',
    },
    {
        id: 3,
        name: "小红书文案大师",
        description: '精通小红书爆款文案创作',
        prompt: '扮演角色',
        temperature: 1,
        avatar: '/src/assets/avatar/4.png',
        category: '文本编辑',
    }
]

const AgentManage: FC = () => {
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-x-hidden overflow-y-auto gap-4">
            <p className="font-bold text-2xl">智能体管理</p>
            <Button className="w-40 !py-4" icon={<PlusOutlined/>} color="primary" variant="solid">添加智能体</Button>
            <Table<DataType>
                sticky
                columns={columns}
                dataSource={data}
                pagination={{
                    position: ["bottomCenter"],
                    current: 1,
                    pageSize: 10,
                    total: 3,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                }}
            />

        </div>
    );
};

export default AgentManage;
