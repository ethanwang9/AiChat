import {FC} from "react";
import {Button, Space, Table, TableProps} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

interface DataType {
    id: string;
    operate: string;
    uid: string;
    job: string;
    content: string;
}

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
        title: '操作',
        key: 'action',
        render: () => (
            <Space>
                <Button type="text" danger icon={<DeleteOutlined/>}/>
            </Space>
        ),
    },
];

const data: DataType[] = Array.from({length: 50}).map((_, index) => {
    return {
        id: `LOG${index + 1000}`,
        operate: '查询',
        uid: `USER${index + 100}`,
        job: '对话任务',
        content: '今天重庆天气如何',
    }
})

const LogManage: FC = () => {
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">日志管理</p>
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

export default LogManage;
