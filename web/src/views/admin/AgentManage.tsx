import {FC, useState} from "react";
import {Button, Space, Table, TableProps, Modal, Form, Input, Slider, Upload, message} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import { useMount, useRequest } from "ahooks";
import { GetAdminAgent, DeleteAdminAgent, CreateAdminAgent, UpdateAdminAgent } from "@/apis/admin";
import { HTTPAdminManagerAgentGet } from "@/types/http/admin";

interface DataType {
    id: number;
    name: string;
    description: string;
    prompt: string;
    temperature: number;
    avatar: string;
    category: string;
}

const AgentManage: FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
    const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
    const [currentAgent, setCurrentAgent] = useState<DataType | null>(null);
    const [agentData, setAgentData] = useState<DataType[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    
    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setAvatarUrl('');
        setAvatarFile(null);
    };
    
    // 显示编辑智能体模态框
    const showEditModal = (record: DataType) => {
        // 保存当前正在编辑的智能体信息
        setCurrentAgent(record);
        
        // 设置头像预览URL
        setEditAvatarUrl(record.avatar);
        
        // 重置头像文件，如果用户不上传新头像则保持为null
        setEditAvatarFile(null);
        
        // 设置表单初始值
        editForm.setFieldsValue({
            name: record.name,
            description: record.description,
            prompt: record.prompt,
            temperature: record.temperature,
            category: record.category
        });
        
        // 显示编辑模态框
        setIsEditModalOpen(true);
    };
    
    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditAvatarUrl('');
        setEditAvatarFile(null);
        setCurrentAgent(null);
    };
    
    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                CreateAdminAgent(
                    values.name,
                    values.description,
                    values.prompt,
                    values.temperature,
                    avatarFile,
                    values.category
                ).then(() => {
                    message.success('智能体添加成功');
                    handleCancel();
                    getAgentPage(pagination.pageSize, pagination.current);
                }).catch(err => {
                    message.error('添加失败: ' + err.message);
                });
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };
    
    const handleEditSubmit = () => {
        editForm.validateFields()
            .then(values => {
                if (!currentAgent) {
                    message.error('找不到要编辑的智能体');
                    return;
                }
                
                UpdateAdminAgent(
                    currentAgent.id,
                    values.name,
                    values.description,
                    values.prompt,
                    values.temperature,
                    editAvatarFile,
                    values.category
                ).then(() => {
                    message.success('智能体更新成功');
                    handleEditCancel();
                    getAgentPage(pagination.pageSize, pagination.current);
                }).catch(err => {
                    message.error('更新失败: ' + (err.message || '未知错误'));
                });
            })
            .catch(info => {
                console.log('表单验证失败:', info);
            });
    };
    
    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    
    const handleAvatarChange = (info: any) => {
        if (info.file.originFileObj) {
            setAvatarFile(info.file.originFileObj);
            setAvatarUrl(URL.createObjectURL(info.file.originFileObj));
            
            if (info.file.status === 'done') {
                message.success(`${info.file.name} 准备就绪`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 处理失败`);
            }
        } else if (info.file.status === 'removed') {
            setAvatarFile(null);
            setAvatarUrl('');
        }
    };
    
    const handleEditAvatarChange = (info: any) => {
        if (info.file.originFileObj) {
            setEditAvatarFile(info.file.originFileObj);
            setEditAvatarUrl(URL.createObjectURL(info.file.originFileObj));
            
            if (info.file.status === 'done') {
                message.success(`${info.file.name} 准备就绪`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 处理失败`);
            }
        } else if (info.file.status === 'removed') {
            setEditAvatarFile(null);
            setEditAvatarUrl(currentAgent?.avatar || '');
        }
    };

    const { run: getAgentPage, loading: getAgentPageLoading } = useRequest(
        (limit: number, page: number) => GetAdminAgent(limit, page),
        {
            manual: true,
            onSuccess: (response) => {
                const data = response as unknown as HTTPAdminManagerAgentGet;
                
                const tableData = data.agent.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    prompt: item.prompt,
                    temperature: item.temperature,
                    avatar: item.avatar,
                    category: item.category
                }));
                
                setAgentData(tableData);
                setPagination(prev => ({ ...prev, total: data.total }));
            },
        }
    );

    const handlePaginationChange = (page: number, pageSize: number) => {
        setPagination(prev => ({ ...prev, current: page, pageSize }));
        getAgentPage(pageSize, page);
    };

    useMount(() => {
        getAgentPage(pagination.pageSize, pagination.current);
    });

    const { run: deleteAgent } = useRequest(
        (id: number) => DeleteAdminAgent(id),
        {
            manual: true,
            onSuccess: () => {
                message.success("删除成功");
                getAgentPage(pagination.pageSize, pagination.current);
            },
        }
    );

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
            render: (_, record) => (
                <Space>
                    <Button 
                        type="text" 
                        icon={<EditOutlined/>} 
                        onClick={() => showEditModal(record)}
                        title="编辑智能体"
                    />
                    <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined/>} 
                        onClick={() => Modal.confirm({
                            title: '危险操作',
                            content: '确定删除该智能体吗？',
                            okText: '确定',
                            cancelText: '取消',
                            onOk: () => {
                                deleteAgent(record.id);
                            },
                        })}
                        title="删除智能体"
                    />
                </Space>
            ),
        },
    ];
    
    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-x-hidden overflow-y-auto gap-4">
            <p className="font-bold text-2xl">智能体管理</p>
            <Button className="w-40 !py-4" icon={<PlusOutlined/>} color="primary" variant="solid" onClick={showModal}>添加智能体</Button>
            <Table<DataType>
                sticky
                loading={getAgentPageLoading}
                columns={columns}
                dataSource={agentData}
                rowKey="id"
                pagination={{
                    position: ["bottomCenter"],
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                    onChange: handlePaginationChange,
                }}
            />
            
            <Modal
                title="添加智能体"
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText="保存"
                cancelText="取消"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="agentForm"
                    initialValues={{ temperature: 1 }}
                >
                    <Form.Item
                        name="avatar"
                        label="头像"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: '请上传头像' }]}
                    >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            showUploadList={true}
                            maxCount={1}
                            beforeUpload={(file) => {
                                setAvatarFile(file);
                                return false;
                            }}
                            onChange={handleAvatarChange}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>上传</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入智能体名称' }]}
                    >
                        <Input placeholder="请输入智能体名称" />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="介绍"
                        rules={[{ required: true, message: '请输入智能体介绍' }]}
                    >
                        <Input.TextArea rows={3} placeholder="请输入智能体介绍" />
                    </Form.Item>
                    
                    <Form.Item
                        name="prompt"
                        label="提示词"
                        rules={[{ required: true, message: '请输入提示词' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入提示词" />
                    </Form.Item>
                    
                    <Form.Item
                        name="temperature"
                        label="温度"
                        rules={[{ required: true, message: '请设置温度值' }]}
                    >
                        <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            marks={{
                                0: '0',
                                1: '1',
                                2: '2'
                            }}
                            tooltip={{ formatter: value => `${value}` }}
                        />
                    </Form.Item>
                    
                    <Form.Item
                        name="category"
                        label="类别"
                        rules={[{ required: true, message: '请输入类别' }]}
                    >
                        <Input placeholder="请输入类别" />
                    </Form.Item>
                </Form>
            </Modal>
            
            <Modal
                title="编辑智能体"
                open={isEditModalOpen}
                onCancel={handleEditCancel}
                onOk={handleEditSubmit}
                okText="更新"
                cancelText="取消"
                width={600}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    name="editAgentForm"
                >
                    <Form.Item
                        name="avatar"
                        label="头像"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        extra="不上传新头像则保留原有头像"
                    >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            showUploadList={true}
                            maxCount={1}
                            beforeUpload={(file) => {
                                setEditAvatarFile(file);
                                return false;
                            }}
                            onChange={handleEditAvatarChange}
                        >
                            {editAvatarUrl ? (
                                <img 
                                    src={editAvatarUrl} 
                                    alt="avatar" 
                                    style={{ width: '100%' }} 
                                />
                            ) : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>上传</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入智能体名称' }]}
                    >
                        <Input placeholder="请输入智能体名称" />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="介绍"
                        rules={[{ required: true, message: '请输入智能体介绍' }]}
                    >
                        <Input.TextArea rows={3} placeholder="请输入智能体介绍" />
                    </Form.Item>
                    
                    <Form.Item
                        name="prompt"
                        label="提示词"
                        rules={[{ required: true, message: '请输入提示词' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入提示词" />
                    </Form.Item>
                    
                    <Form.Item
                        name="temperature"
                        label="温度"
                        rules={[{ required: true, message: '请设置温度值' }]}
                    >
                        <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            marks={{
                                0: '0',
                                1: '1',
                                2: '2'
                            }}
                            tooltip={{ formatter: value => `${value}` }}
                        />
                    </Form.Item>
                    
                    <Form.Item
                        name="category"
                        label="类别"
                        rules={[{ required: true, message: '请输入类别' }]}
                    >
                        <Input placeholder="请输入类别" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AgentManage;
