import { FC } from "react";
import { Button, Space, Table, TableProps } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

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
                <Button type="text" icon={<EditOutlined />} />
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Space>
        ),
    },
];

const data: DataType[] = [
    {
        group_id: "5c392dfe9c464d0a9c1cd8d4868fa865",
        title: 'hi，你是谁？',
        created_at: "2025-05-05 17:07:49",
    }
]

const History: FC = () => {
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">历史对话记录</p>
            <Button className="w-40 !py-4" icon={<DeleteOutlined />} color="danger" variant="solid">清除所有记录</Button>
            <Table<DataType>
                sticky
                columns={columns}
                dataSource={data}
                pagination={{
                    position: ["bottomCenter"],
                    current: 1,
                    pageSize: 1,
                    total: 1,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                }}
            />

        </div>
    );
};

export default History;
