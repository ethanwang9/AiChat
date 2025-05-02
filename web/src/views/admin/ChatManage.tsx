import {FC} from "react";
import {Button, Space, Table, TableProps, Tabs, TabsProps} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

interface DataType {
    key: string;
    name: string;
    time: string;
}
// TODO 待编辑
const columns: TableProps<DataType>['columns'] = [
    {
        title: '对话名称',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '创建时间',
        dataIndex: 'time',
        key: 'time',
    },
    {
        title: '操作',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Button color="primary" variant="text">查看</Button>
                <Button color="danger" variant="text">删除记录</Button>
            </Space>
        ),
    },
];

const data: DataType[] = Array.from({length: 50}).map(() => {
    return {
        key: '1',
        name: '今天重庆天气如何',
        time: "2025-05-01 22:56:31",
    }
})

const items: TabsProps['items'] = [
    {
        key: 'chat',
        label: '对话',
        children: <Table<DataType>
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
    },
    {
        key: 'agent',
        label: '智能体',
        children: <Table<DataType>
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
    },
    {
        key: 'pk',
        label: '擂台',
        children: <Table<DataType>
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
    },
];

const ChatManage: FC = () => {
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">对话管理</p>
            <Tabs
                defaultActiveKey="chat"
                items={items}
            />
        </div>
    );
};

export default ChatManage;
