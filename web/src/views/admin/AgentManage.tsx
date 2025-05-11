import {FC, useState} from "react";
import {Button, Space, Table, TableProps, Modal, Form, Input, Slider, Select, Upload, message} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined} from "@ant-design/icons";

interface DataType {
    id: number;
    name: string;
    description: string;
    prompt: string;
    temperature: number;
    avatar: string;
    category: string;
}

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
    const [currentAgent, setCurrentAgent] = useState<DataType | null>(null);
    
    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setAvatarUrl('');
    };
    
    const showEditModal = (record: DataType) => {
        setCurrentAgent(record);
        setEditAvatarUrl(record.avatar);
        editForm.setFieldsValue({
            name: record.name,
            description: record.description,
            prompt: record.prompt,
            temperature: record.temperature,
            category: record.category
        });
        setIsEditModalOpen(true);
    };
    
    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditAvatarUrl('');
        setCurrentAgent(null);
    };
    
    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                console.log('Form values:', {...values, avatar: avatarUrl});
                message.success('智能体添加成功');
                handleCancel();
                // 这里可以添加实际的API调用来保存数据
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };
    
    const handleEditSubmit = () => {
        editForm.validateFields()
            .then(values => {
                console.log('Edit form values:', {...values, avatar: editAvatarUrl, id: currentAgent?.id});
                message.success('智能体更新成功');
                handleEditCancel();
                // 这里可以添加实际的API调用来更新数据
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };
    
    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    
    const handleAvatarChange = (info: any) => {
        if (info.file.status === 'done') {
            // 实际项目中这里应该使用上传后返回的URL
            // 这里仅做演示，使用本地路径
            setAvatarUrl(`/src/assets/avatar/${info.file.name}`);
            message.success(`${info.file.name} 上传成功`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`);
        }
    };
    
    const handleEditAvatarChange = (info: any) => {
        if (info.file.status === 'done') {
            // 实际项目中这里应该使用上传后返回的URL
            // 这里仅做演示，使用本地路径
            setEditAvatarUrl(`/src/assets/avatar/${info.file.name}`);
            message.success(`${info.file.name} 上传成功`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`);
        }
    };

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
                    <Button type="text" icon={<EditOutlined/>} onClick={() => showEditModal(record)}/>
                    <Button type="text" danger icon={<DeleteOutlined/>}/>
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
                            action="/api/upload" // 实际项目中需要替换为真实的上传接口
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
                    >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            showUploadList={true}
                            maxCount={1}
                            action="/api/upload" // 实际项目中需要替换为真实的上传接口
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
