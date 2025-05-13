import { FC, useState } from "react";
import { Button, Input, Table, Space, Tag, message, Modal, Form, Select, Upload } from "antd";
import type { TableProps, UploadProps } from "antd";
import { DeleteOutlined, EditOutlined, UploadOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useMount, useRequest } from "ahooks";
import { GetAdminUserList, UpdateAdminUser, DeleteAdminManagerUser } from "@/apis/admin";
import { HTTPAdminUserListGet } from "@/types/http/admin";
import { formatDate } from "@/utils/tools";

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

interface UserFormData {
    uid: number;
    name: string;
    mail: string;
    phone: string;
    status: "use" | "stop" | "destroy";
    role: "user" | "admin";
}

const UserManage: FC = () => {
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [userData, setUserData] = useState<UserData[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [userAvatar, setUserAvatar] = useState<File | null>(null);
    const [form] = Form.useForm<UserFormData>();

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

    // 获取用户列表数据
    const { run: fetchUserList } = useRequest(
        (limit: number, offset: number, uid: number, name: string) =>
            GetAdminUserList(limit, offset, uid, name),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminUserListGet;
                setUserData(data.user.map(user => ({
                    ...user,
                    status: user.status as "use" | "stop" | "destroy",
                    role: user.role as "user" | "admin"
                })));
                setPagination(prev => ({
                    ...prev,
                    total: data.total
                }));
                setLoading(false);
            },
            onError: () => {
                message.error("获取用户列表失败");
                setLoading(false);
            }
        }
    );

    // 更新用户信息
    const { run: updateUser, loading: updating } = useRequest(
        (values: UserFormData, avatar: File | null) =>
            UpdateAdminUser(
                values.uid,
                values.name,
                values.mail,
                values.phone,
                avatar,
                values.status,
                values.role
            ),
        {
            manual: true,
            onSuccess: () => {
                message.success("更新用户信息成功");
                setEditModalVisible(false);
                // 重新加载当前页数据
                fetchUserList(
                    pagination.pageSize,
                    pagination.current,
                    userId ? parseInt(userId) : 0,
                    userName
                );
            },
            onError: () => {
                message.error("更新用户信息失败");
            }
        }
    );

    // 删除用户
    const { run: deleteUser } = useRequest(
        (uid: number) => DeleteAdminManagerUser(uid),
        {
            manual: true,
            onSuccess: () => {
                message.success("删除用户成功");
                // 重新加载当前页数据
                fetchUserList(
                    pagination.pageSize,
                    pagination.current,
                    userId ? parseInt(userId) : 0,
                    userName
                );
            },
            onError: () => {
                message.error("删除用户失败");
            }
        }
    );

    // 处理删除用户
    const handleDeleteUser = (user: UserData) => {
        Modal.confirm({
            title: "危险操作",
            icon: <ExclamationCircleFilled />,
            content: `确定要删除用户 "${user.name}" 吗？此操作不可恢复。`,
            okText: "确认",
            okType: "danger",
            cancelText: "取消",
            onOk: () => {
                deleteUser(user.uid);
            }
        });
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
            render: (mail: string) => {
                return mail || "无";
            },
        },
        {
            title: "手机号",
            dataIndex: "phone",
            key: "phone",
            render: (phone: string) => {
                return phone || "无";
            },
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
            render: (time: string) => {
                return formatDate(time);
            },
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteUser(record)}
                    />
                </Space>
            ),
        },
    ];

    // 处理编辑用户
    const handleEditUser = (user: UserData) => {
        setCurrentUser(user);
        form.setFieldsValue({
            uid: user.uid,
            name: user.name,
            mail: user.mail,
            phone: user.phone,
            status: user.status,
            role: user.role
        });
        setEditModalVisible(true);
    };

    // 处理提交表单
    const handleSubmit = () => {
        form.validateFields().then(values => {
            updateUser(values, userAvatar);
        }).catch(error => {
            console.error("表单验证失败:", error);
        });
    };

    // 处理头像上传
    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            // 验证文件类型
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('只能上传图片文件!');
                return false;
            }

            setUserAvatar(file);
            return false; // 阻止自动上传
        },
        showUploadList: false,
    };

    // 搜索用户
    const handleSearch = () => {
        setLoading(true);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchUserList(
            pagination.pageSize,
            1,
            userId ? parseInt(userId) : 0,
            userName
        );
    };

    // 处理分页变化
    const handleTableChange = (page: number, pageSize: number) => {
        setLoading(true);
        setPagination(prev => ({ ...prev, current: page, pageSize }));
        fetchUserList(
            pageSize,
            page,
            userId ? parseInt(userId) : 0,
            userName
        );
    };

    // 组件挂载时加载第一页数据
    useMount(() => {
        setLoading(true);
        fetchUserList(pagination.pageSize, 1, 0, "");
    });

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
                    搜索
                </Button>
            </div>

            {/* 用户表格 */}
            <Table
                columns={columns}
                dataSource={userData}
                rowKey="uid"
                loading={loading}
                pagination={{
                    position: ["bottomCenter"],
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: handleTableChange,
                }}
            />

            {/* 编辑用户弹窗 */}
            <Modal
                title="编辑用户"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleSubmit}
                confirmLoading={updating}
                maskClosable={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item name="uid" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="用户名"
                        name="name"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="mail"
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        label="手机号"
                        name="phone"
                    >
                        <Input placeholder="请输入手机号" />
                    </Form.Item>

                    <Form.Item
                        label="头像"
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>上传新头像</Button>
                        </Upload>
                        {userAvatar && <p className="mt-2">已选择: {userAvatar.name}</p>}
                        {currentUser && !userAvatar && (
                            <div className="mt-2 flex items-center">
                                <span className="mr-2">当前头像:</span>
                                <div className="h-8 w-8 overflow-hidden rounded-full">
                                    <img
                                        src={currentUser.avatar}
                                        alt="avatar"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="状态"
                        name="status"
                        rules={[{ required: true, message: '请选择用户状态!' }]}
                    >
                        <Select>
                            <Select.Option value="use">正常</Select.Option>
                            <Select.Option value="stop">禁用</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="角色"
                        name="role"
                        rules={[{ required: true, message: '请选择用户角色!' }]}
                    >
                        <Select>
                            <Select.Option value="user">用户</Select.Option>
                            <Select.Option value="admin">管理员</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManage;
