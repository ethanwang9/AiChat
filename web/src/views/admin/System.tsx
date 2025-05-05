import {FC, useState} from "react";
import {Tabs, Input, Button, Upload, message, Form, Alert} from "antd";
import {UploadOutlined} from "@ant-design/icons";

const {TabPane} = Tabs;

const System: FC = () => {
    const [activeTab, setActiveTab] = useState("system");
    const [systemForm] = Form.useForm();
    const [loginForm] = Form.useForm();
    const [systemLogo, setSystemLogo] = useState("");

    const handleSystemSave = async () => {
        try {
            const values = await systemForm.validateFields();
            console.log('System form values:', {...values, systemLogo});
            message.success("系统配置保存成功");
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleLoginSave = async () => {
        try {
            const values = await loginForm.validateFields();
            console.log('Login form values:', values);
            message.success("登录配置保存成功");
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleLogoChange = (info: any) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`);
            // Here you would normally update the systemLogo with the URL from the server
            setSystemLogo(URL.createObjectURL(info.file.originFileObj));
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`);
        }
    };

    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">系统设置</p>

            <Tabs activeKey={activeTab} onChange={setActiveTab} className="w-full bg-white !px-8 box-border">
                <TabPane tab="系统配置" key="system">
                    <Form
                        form={systemForm}
                        layout="vertical"
                        className="max-w-xl"
                        initialValues={{
                            systemName: "",
                            itDeptCode: "",
                            policeDeptCode: ""
                        }}
                    >
                        <Form.Item label="系统 LOGO" className="mb-2">
                            <div className="flex items-center">
                                {systemLogo ? (
                                    <img
                                        src={systemLogo}
                                        alt="系统LOGO"
                                        className="w-12 h-12 mr-3 object-contain"
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 mr-3 bg-gray-100 flex items-center justify-center text-xs">
                                        LOGO
                                    </div>
                                )}
                                <Upload
                                    name="logo"
                                    action="/api/upload" // Replace with your actual upload endpoint
                                    onChange={handleLogoChange}
                                    showUploadList={false}
                                >
                                    <Button icon={<UploadOutlined/>}>更改</Button>
                                </Upload>
                            </div>
                        </Form.Item>

                        <Form.Item label="系统名称" name="systemName"
                                   rules={[{required: true, message: '请输入系统名称'}]}
                        >
                            <Input placeholder="请输入系统名称"/>
                        </Form.Item>

                        <Form.Item label="工信部备案号" name="itDeptCode">
                            <Input placeholder="请输入工信部备案号"/>
                        </Form.Item>

                        <Form.Item label="公安部备案号" name="policeDeptCode">
                            <Input placeholder="请输入公安部备案号"/>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" onClick={handleSystemSave}>保存更改</Button>
                        </Form.Item>
                    </Form>
                </TabPane>

                <TabPane tab="登录配置" key="oauth">
                    <Form
                        form={loginForm}
                        layout="vertical"
                        className="max-w-xl"
                        initialValues={{
                            apiEndpoint: "",
                            appId: "",
                            key: ""
                        }}
                    >
                        <Form.Item
                            label="接口地址"
                            name="apiEndpoint"
                            rules={[{required: true, message: '请输入接口地址'}]}
                        >
                            <Input placeholder="请输入接口地址"/>
                        </Form.Item>

                        <Form.Item
                            label="APPID"
                            name="appId"
                            rules={[{required: true, message: '请输入APPID'}]}
                        >
                            <Input placeholder="请输入APPID"/>
                        </Form.Item>

                        <Form.Item
                            label="KEY"
                            name="key"
                            rules={[{required: true, message: '请输入KEY'}]}
                        >
                            <Input placeholder="请输入KEY"/>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" onClick={handleLoginSave}>保存更改</Button>
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default System;
