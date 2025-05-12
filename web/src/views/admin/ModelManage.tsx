import {FC, useState} from "react";
import {Button, Table, Tabs, Space, Tag, message, Modal, Form, Input, Select} from "antd";
import type {TableProps} from "antd";
import {EditOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {useMount, useRequest} from "ahooks";
import {
    GetAdminModelChannel, 
    GetAdminModelList, 
    UpdateAdminModelChannel, 
    UpdateAdminModelList,
    DeleteAdminModelChannel,
    DeleteAdminModelList,
    CreateAdminModelChannel,
    CreateAdminModelList
} from "@/apis/admin";
import {HTTPAdminManagerModelChannelGet, HTTPAdminManagerModelListGet} from "@/types/http/admin";
import {formatDate} from "@/utils/tools";

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
    nickname: string;
    status: "use" | "stop";
    created_at: string;
    channel_name?: string; // 关联通道名称，用于显示
}

const ModelManage: FC = () => {
    // 状态管理
    const [vendorData, setVendorData] = useState<VendorData[]>([]);
    const [modelData, setModelData] = useState<ModelData[]>([]);
    const [channelPagination, setChannelPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [modelPagination, setModelPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 模态框状态
    const [channelModalVisible, setChannelModalVisible] = useState(false);
    const [modelModalVisible, setModelModalVisible] = useState(false);
    const [addChannelModalVisible, setAddChannelModalVisible] = useState(false);
    const [addModelModalVisible, setAddModelModalVisible] = useState(false);
    const [currentChannel, setCurrentChannel] = useState<VendorData | null>(null);
    const [currentModel, setCurrentModel] = useState<ModelData | null>(null);
    
    // 表单实例
    const [channelForm] = Form.useForm();
    const [modelForm] = Form.useForm();
    const [addChannelForm] = Form.useForm();
    const [addModelForm] = Form.useForm();

    // 获取通道数据
    const { run: getChannelData, loading: channelLoading } = useRequest(
        (limit: number, page: number) => GetAdminModelChannel(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminManagerModelChannelGet;
                setVendorData(data.channel);
                setChannelPagination(prev => ({ ...prev, total: data.total }));
            },
            onError: () => {
                message.error("获取通道数据失败");
            }
        }
    );

    // 获取模型数据
    const { run: getModelData, loading: modelLoading } = useRequest(
        (limit: number, page: number) => GetAdminModelList(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminManagerModelListGet;
                
                // 将API返回的数据格式转换为组件使用的格式
                const formattedData = data.list.map(item => ({
                    id: item.id,
                    cid: item.cid,
                    name: item.name,
                    nickname: item.nickname,
                    status: item.status as "use" | "stop",
                    created_at: item.created_at,
                    // 这里可以添加通道名称映射，如果有需要
                    channel_name: vendorData.find(v => v.id === item.cid)?.name || `通道${item.cid}`
                }));
                
                setModelData(formattedData);
                setModelPagination(prev => ({ ...prev, total: data.total }));
            },
            onError: () => {
                message.error("获取模型数据失败");
            }
        }
    );

    // 处理通道分页变化
    const handleChannelPaginationChange = (page: number, pageSize: number) => {
        setChannelPagination(prev => ({ ...prev, current: page, pageSize }));
        getChannelData(pageSize, page);
    };

    // 处理模型分页变化
    const handleModelPaginationChange = (page: number, pageSize: number) => {
        setModelPagination(prev => ({ ...prev, current: page, pageSize }));
        getModelData(pageSize, page);
    };

    // 生命周期 - 挂载
    useMount(() => {
        // 初始化加载第一页数据
        getChannelData(channelPagination.pageSize, channelPagination.current);
        getModelData(modelPagination.pageSize, modelPagination.current);
    });

    // 处理编辑通道
    const handleEditChannel = (record: VendorData) => {
        setCurrentChannel(record);
        channelForm.setFieldsValue(record);
        setChannelModalVisible(true);
    };

    // 处理编辑模型
    const handleEditModel = (record: ModelData) => {
        setCurrentModel(record);
        modelForm.setFieldsValue(record);
        setModelModalVisible(true);
    };

    // 添加通道
    const { run: createChannel, loading: createChannelLoading } = useRequest(
        (name: string, key: string, url: string) => 
            CreateAdminModelChannel(name.trim(), key.trim(), url.trim()),
        {
            manual: true,
            onSuccess: () => {
                message.success('添加供应商成功');
                setAddChannelModalVisible(false);
                addChannelForm.resetFields();
                
                // 刷新数据
                getChannelData(channelPagination.pageSize, channelPagination.current);
            },
            onError: () => {
                message.error('添加供应商失败');
            }
        }
    );

    // 处理添加通道表单提交
    const handleAddChannelFormSubmit = async () => {
        try {
            const values = await addChannelForm.validateFields();
            createChannel(
                values.name, 
                values.key, 
                values.url
            );
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    // 打开添加供应商模态框
    const showAddChannelModal = () => {
        addChannelForm.resetFields();
        setAddChannelModalVisible(true);
    };

    // 添加模型
    const { run: createModel, loading: createModelLoading } = useRequest(
        (cid: number, name: string, nickname: string, status: string) => 
            CreateAdminModelList(cid, name.trim(), nickname.trim(), status),
        {
            manual: true,
            onSuccess: () => {
                message.success('添加模型成功');
                setAddModelModalVisible(false);
                addModelForm.resetFields();
                
                // 刷新数据
                getModelData(modelPagination.pageSize, modelPagination.current);
            },
            onError: () => {
                message.error('添加模型失败');
            }
        }
    );

    // 处理添加模型表单提交
    const handleAddModelFormSubmit = async () => {
        try {
            const values = await addModelForm.validateFields();
            createModel(
                values.cid,
                values.name,
                values.nickname,
                values.status
            );
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    // 打开添加模型模态框
    const showAddModelModal = () => {
        addModelForm.resetFields();
        setAddModelModalVisible(true);
    };

    // 处理通道表单提交
    const { run: updateChannel, loading: updateChannelLoading } = useRequest(
        (id: number, name: string, url: string, key: string) => 
            UpdateAdminModelChannel(id, name.trim(), url.trim(), key.trim()),
        {
            manual: true,
            onSuccess: () => {
                message.success('更新通道成功');
                setChannelModalVisible(false);
                // 刷新数据
                getChannelData(channelPagination.pageSize, channelPagination.current);
            },
            onError: () => {
                message.error('更新通道失败');
            }
        }
    );

    const handleChannelFormSubmit = async () => {
        try {
            const values = await channelForm.validateFields();
            updateChannel(
                values.id, 
                values.name, 
                values.url, 
                values.key
            );
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    // 处理模型表单提交
    const { run: updateModel, loading: updateModelLoading } = useRequest(
        (id: number, cid: number, name: string, nickname: string, status: string) => 
            UpdateAdminModelList(id, cid, name.trim(), nickname.trim(), status),
        {
            manual: true,
            onSuccess: () => {
                message.success('更新模型成功');
                setModelModalVisible(false);
                // 刷新数据
                getModelData(modelPagination.pageSize, modelPagination.current);
            },
            onError: () => {
                message.error('更新模型失败');
            }
        }
    );

    const handleModelFormSubmit = async () => {
        try {
            const values = await modelForm.validateFields();
            updateModel(
                values.id,
                values.cid,
                values.name,
                values.nickname,
                values.status
            );
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    // 删除通道
    const { run: deleteChannel, loading: deleteChannelLoading } = useRequest(
        (id: number) => DeleteAdminModelChannel(id),
        {
            manual: true,
            onSuccess: () => {
                message.success('删除通道成功');
                // 刷新数据
                getChannelData(channelPagination.pageSize, channelPagination.current);
            },
            onError: () => {
                message.error('删除通道失败');
            }
        }
    );

    // 处理删除通道
    const handleDeleteChannel = (id: number) => {
        Modal.confirm({
            title: '危险操作',
            content: '确定要删除此通道吗？删除后无法恢复。',
            okText: '确认',
            okButtonProps: { loading: deleteChannelLoading },
            cancelText: '取消',
            onOk: () => {
                deleteChannel(id);
            }
        });
    };

    // 删除模型
    const { run: deleteModel, loading: deleteModelLoading } = useRequest(
        (id: number) => DeleteAdminModelList(id),
        {
            manual: true,
            onSuccess: () => {
                message.success('删除模型成功');
                // 刷新数据
                getModelData(modelPagination.pageSize, modelPagination.current);
            },
            onError: () => {
                message.error('删除模型失败');
            }
        }
    );

    // 处理删除模型
    const handleDeleteModel = (id: number) => {
        Modal.confirm({
            title: '危险操作',
            content: '确定要删除此模型吗？删除后无法恢复。',
            okText: '确认',
            okButtonProps: { loading: deleteModelLoading },
            cancelText: '取消',
            onOk: () => {
                deleteModel(id);
            }
        });
    };

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
            render: (date: string) => formatDate(date),
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => handleEditChannel(record)} />
                    <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined/>} 
                        onClick={() => handleDeleteChannel(record.id)}
                    />
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
            title: "显示名称",
            dataIndex: "nickname",
            key: "nickname",
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
            render: (date: string) => formatDate(date),
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => handleEditModel(record)} />
                    <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined/>} 
                        onClick={() => handleDeleteModel(record.id)}
                    />
                </Space>
            ),
        },
    ];

    // 定义 Tabs 的 items
    const tabItems = [
        {
            key: "channel",
            label: "通道管理",
            children: (
                <div className="flex flex-col gap-4">
                    <Button 
                        className="w-25" 
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showAddChannelModal}
                    >
                        添加供应商
                    </Button>
                    <Table
                        columns={vendorColumns}
                        dataSource={vendorData}
                        rowKey="id"
                        loading={channelLoading}
                        pagination={{
                            position: ["bottomCenter"],
                            current: channelPagination.current,
                            pageSize: channelPagination.pageSize,
                            total: channelPagination.total,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                            onChange: handleChannelPaginationChange,
                        }}
                    />
                </div>
            ),
        },
        {
            key: "model",
            label: "模型管理",
            children: (
                <div className="flex flex-col gap-4">
                    <Button 
                        className="w-25" 
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showAddModelModal}
                    >
                        添加模型
                    </Button>
                    <Table
                        columns={modelColumns}
                        dataSource={modelData}
                        rowKey="id"
                        loading={modelLoading}
                        pagination={{
                            position: ["bottomCenter"],
                            current: modelPagination.current,
                            pageSize: modelPagination.pageSize,
                            total: modelPagination.total,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                            onChange: handleModelPaginationChange,
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-x-hidden overflow-y-auto gap-4">
            <h1 className="text-2xl font-bold">模型管理</h1>
            <Tabs defaultActiveKey="channel" items={tabItems} />

            {/* 通道编辑模态框 */}
            <Modal
                title="编辑通道"
                open={channelModalVisible}
                onOk={handleChannelFormSubmit}
                onCancel={() => setChannelModalVisible(false)}
                okText="确认"
                cancelText="取消"
                confirmLoading={updateChannelLoading}
            >
                <Form
                    form={channelForm}
                    layout="vertical"
                    initialValues={currentChannel || {}}
                >
                    <Form.Item name="id" label="通道 ID" hidden>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="供应商名称"
                        rules={[{ required: true, message: '请输入供应商名称' }]}
                    >
                        <Input placeholder="请输入供应商名称" />
                    </Form.Item>
                    <Form.Item
                        name="url"
                        label="API 地址"
                        rules={[{ required: true, message: '请输入API地址' }]}
                    >
                        <Input placeholder="请输入API地址" />
                    </Form.Item>
                    <Form.Item
                        name="key"
                        label="密钥"
                        rules={[{ required: true, message: '请输入密钥' }]}
                    >
                        <Input.Password placeholder="请输入密钥" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加供应商模态框 */}
            <Modal
                title="添加供应商"
                open={addChannelModalVisible}
                onOk={handleAddChannelFormSubmit}
                onCancel={() => setAddChannelModalVisible(false)}
                okText="确认"
                cancelText="取消"
                confirmLoading={createChannelLoading}
            >
                <Form
                    form={addChannelForm}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="供应商名称"
                        rules={[{ required: true, message: '请输入供应商名称' }]}
                    >
                        <Input placeholder="请输入供应商名称" />
                    </Form.Item>
                    <Form.Item
                        name="url"
                        label="API 地址"
                        rules={[{ required: true, message: '请输入API地址' }]}
                    >
                        <Input placeholder="请输入API地址" />
                    </Form.Item>
                    <Form.Item
                        name="key"
                        label="密钥"
                        rules={[{ required: true, message: '请输入密钥' }]}
                    >
                        <Input.Password placeholder="请输入密钥" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加模型模态框 */}
            <Modal
                title="添加模型"
                open={addModelModalVisible}
                onOk={handleAddModelFormSubmit}
                onCancel={() => setAddModelModalVisible(false)}
                okText="确认"
                cancelText="取消"
                confirmLoading={createModelLoading}
            >
                <Form
                    form={addModelForm}
                    layout="vertical"
                >
                    <Form.Item
                        name="cid"
                        label="通道"
                        rules={[{ required: true, message: '请选择通道' }]}
                    >
                        <Select placeholder="请选择通道">
                            {vendorData.map(vendor => (
                                <Select.Option key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="模型名称"
                        rules={[{ required: true, message: '请输入模型名称' }]}
                    >
                        <Input placeholder="请输入模型名称" />
                    </Form.Item>
                    <Form.Item
                        name="nickname"
                        label="显示名称"
                        rules={[{ required: true, message: '请输入显示名称' }]}
                    >
                        <Input placeholder="请输入显示名称" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                        initialValue="use"
                    >
                        <Select placeholder="请选择状态">
                            <Select.Option value="use">生效</Select.Option>
                            <Select.Option value="stop">停用</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 模型编辑模态框 */}
            <Modal
                title="编辑模型"
                open={modelModalVisible}
                onOk={handleModelFormSubmit}
                onCancel={() => setModelModalVisible(false)}
                okText="确认"
                cancelText="取消"
                confirmLoading={updateModelLoading}
            >
                <Form
                    form={modelForm}
                    layout="vertical"
                    initialValues={currentModel || {}}
                >
                    <Form.Item name="id" label="模型 ID" hidden>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="cid"
                        label="通道"
                        rules={[{ required: true, message: '请选择通道' }]}
                    >
                        <Select placeholder="请选择通道">
                            {vendorData.map(vendor => (
                                <Select.Option key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="模型名称"
                        rules={[{ required: true, message: '请输入模型名称' }]}
                    >
                        <Input placeholder="请输入模型名称" />
                    </Form.Item>
                    <Form.Item
                        name="nickname"
                        label="显示名称"
                        rules={[{ required: true, message: '请输入显示名称' }]}
                    >
                        <Input placeholder="请输入显示名称" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select placeholder="请选择状态">
                            <Select.Option value="use">生效</Select.Option>
                            <Select.Option value="stop">停用</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ModelManage;
