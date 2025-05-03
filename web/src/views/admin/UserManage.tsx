import {FC, useState} from "react";
import {Button, Input, Table, Space, Tag} from "antd";
import type {TableProps} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

interface UserData {
    uid: number;
    name: string;
    mail: string;
    phone: string;
    avatar: string;
    status: "use" | "stop" | "destroy";
    role: "user" | "admin";
    created_at: string;
}

const UserManage: FC = () => {
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");

    // 模拟用户数据
    const userData: UserData[] = [
        {
            uid: 1,
            name: "James Wilson",
            mail: "user1@example.com",
            phone: "13811119999",
            avatar: "/src/assets/avatar/1.jpg",
            status: "stop",
            role: "user",
            created_at: "2024-03-15 14:30",
        },
        {
            uid: 2,
            name: "Emily Chen",
            mail: "user2@example.com",
            phone: "13822229999",
            avatar: "/src/assets/avatar/1.jpg",
            status: "destroy",
            role: "user",
            created_at: "2024-03-15 14:30",
        },
        {
            uid: 3,
            name: "Michael Brown",
            mail: "user3@example.com",
            phone: "13833339999",
            avatar: "/src/assets/avatar/1.jpg",
            status: "use",
            role: "admin",
            created_at: "2024-03-15 14:30",
        },
        {
            uid: 4,
            name: "Sarah Zhang",
            mail: "user4@example.com",
            phone: "13844449999",
            avatar: "/src/assets/avatar/1.jpg",
            status: "stop",
            role: "user",
            created_at: "2024-03-15 14:30",
        },
        {
            uid: 5,
            name: "David Liu",
            mail: "user5@example.com",
            phone: "13855559999",
            avatar: "/src/assets/avatar/1.jpg",
            status: "destroy",
            role: "admin",
            created_at: "2024-03-15 14:30",
        },
    ];

    // 状态映射
    const statusMap = {
        use: "正常",
        stop: "禁用",
        destroy: "注销",
    };

    // 角色映射
    const roleMap = {
        user: "用户",
        admin: "管理员",
    };

    // 表格列配置
    const columns: TableProps<UserData>["columns"] = [
        {
            title: "用户 ID",
            dataIndex: "uid",
            key: "uid",
        },
        {
            title: "头像",
            key: "avatar",
            render: (_, record) => (
                <div className="h-8 w-8 overflow-hidden rounded-full">
                    <img
                        src={record.avatar}
                        alt="avatar"
                        className="h-full w-full object-cover"
                    />
                </div>
            ),
        },
        {
            title: "用户名",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "邮箱",
            dataIndex: "mail",
            key: "mail",
        },
        {
            title: "手机号",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "";
                if (status === "use") color = "success";
                if (status === "stop") color = "error";
                if (status === "destroy") color = "default";

                return (
                    <Tag className="p-2 !text-sm" bordered={false} color={color}>
                        {statusMap[status as keyof typeof statusMap]}
                    </Tag>
                );
            },
        },
        {
            title: "角色",
            dataIndex: "role",
            key: "role",
            render: (role: string) => roleMap[role as keyof typeof roleMap],
        },
        {
            title: "创建时间",
            dataIndex: "created_at",
            key: "createdAt",
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

    // 搜索用户
    const handleSearch = () => {
        console.log("搜索条件:", {userId, userName});
        // 实际应用中这里会调用API进行搜索
    };

    return (
        <div className="box-border flex h-screen w-full flex-col gap-4 overflow-y-auto p-8">
            <p className="text-2xl font-bold">用户管理</p>

            {/* 搜索区域 */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="搜索用户ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="!h-9 max-w-xs"
                />
                <Input
                    placeholder="搜索用户名"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="!h-9 max-w-xs"
                />
                <Button type="primary" onClick={handleSearch} className="w-20">
                    {" "}
                    搜索{" "}
                </Button>
            </div>

            {/* 用户表格 */}
            <Table
                columns={columns}
                dataSource={userData}
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

export default UserManage;
