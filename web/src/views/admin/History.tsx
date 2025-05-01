import {FC} from "react";
import {Button, Space, Table, TableProps} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

interface DataType {
    key: string;
    name: string;
    time: string;
}

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

// {
//     key: '1',
//         name: '今天重庆天气如何',
//     time: "2025-05-01 22:56:31",
// },
// {
//     key: '2',
//         name: '如何才能提高自己，变得更好？',
//     time: "2025-05-01 22:56:31",
// },
const data: DataType[] = Array.from({length: 50}).map(() => {
    return {
        key: '1',
        name: '今天重庆天气如何',
        time: "2025-05-01 22:56:31",
    }
})

const History: FC = () => {
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">历史对话记录</p>
            <Button className="w-40" icon={<DeleteOutlined/>} color="danger" variant="solid">清除所有记录</Button>
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

export default History;
