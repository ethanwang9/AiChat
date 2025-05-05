import {FC} from "react";
import {Button, Space, Table, TableProps} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

interface DataType {
    id: string;
    operate: string;
    uid: number;
    job: string;
    content: string;
    createTime: string;
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
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
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

const data: DataType[] = [
    {
        id: "adbc15911ab944979bb1eb6e56d1bba2",
        operate: "用户操作",
        uid: 1,
        job: "系统设置",
        content: "修改系统配置信息",
        createTime: "2025-05-01 14:32:08"
    },
    {
        id: "c908f0465a284ed088a73b8280a62abe",
        operate: "系统任务",
        uid: 0,
        job: "创建用户",
        content: "自动绑定用户微信OpenID，权限为管理员",
        createTime: "2025-05-01 14:30:00"
    }
]

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
                    total: 1,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                }}
            />
        </div>
    );
};

export default LogManage;
