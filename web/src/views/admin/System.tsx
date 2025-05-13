import {FC, useState, useRef} from "react";
import {Tabs, Input, Button, Upload, message, Form, Spin} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {GetAdminSystemConfig, UpdateAdminSystemConfig, GetAdminSystemAuth, UpdateAdminSystemAuth} from "@/apis/admin";
import {useMount, useRequest} from "ahooks";
import {HTTPAdminSystemConfigGet, HTTPAdminSystemAuthGet} from "@/types/http/admin";
import type { RcFile } from 'antd/es/upload/interface';

const System: FC = () => {
    const [activeTab, setActiveTab] = useState("system");
    const [systemForm] = Form.useForm();
    const [authForm] = Form.useForm();
    const [systemLogo, setSystemLogo] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // 获取系统配置信息
    const {loading: configLoading, run: fetchSystemConfig} = useRequest(
        () => GetAdminSystemConfig(),
        {
            manual: true,
            onSuccess: (response) => {
                const result = response as unknown as HTTPAdminSystemConfigGet;
                // 更新表单数据
                systemForm.setFieldsValue({
                    systemName: result.name,
                    itDeptCode: result.icp,
                    policeDeptCode: result.gov
                });
                // 设置系统logo
                setSystemLogo(result.logo);
            },
            onError: () => {
                message.error("获取系统配置失败");
            }
        }
    );

    // 获取登录配置信息
    const {loading: authLoading, run: fetchAuthConfig} = useRequest(
        () => GetAdminSystemAuth(),
        {
            manual: true,
            onSuccess: (response) => {
                const result = response as unknown as HTTPAdminSystemAuthGet;
                // 更新表单数据
                authForm.setFieldsValue({
                    appId: result.appid,
                    key: result.key
                });
            },
            onError: () => {
                message.error("获取登录配置失败");
            }
        }
    );

    // 保存系统配置信息
    const {loading: savingConfig, run: saveSystemConfig} = useRequest(
        (name: string, gov: string, icp: string, logo: File | null) => 
            UpdateAdminSystemConfig(name, gov, icp, logo),
        {
            manual: true,
            onSuccess: () => {
                message.success("系统配置保存成功");
                // 重新获取最新配置
                fetchSystemConfig();
            },
            onError: () => {
                message.error("系统配置保存失败");
            }
        }
    );

    // 保存登录配置信息
    const {loading: savingAuthConfig, run: saveAuthConfig} = useRequest(
        (appid: string, key: string) => 
            UpdateAdminSystemAuth(appid, key),
        {
            manual: true,
            onSuccess: () => {
                message.success("登录配置保存成功");
                // 重新获取最新配置
                fetchAuthConfig();
            },
            onError: () => {
                message.error("登录配置保存失败");
            }
        }
    );

    // 组件挂载时获取系统配置
    useMount(() => {
        fetchSystemConfig();
        fetchAuthConfig();
    });

    const handleSystemSave = async () => {
        try {
            const values = await systemForm.validateFields();
            saveSystemConfig(
                values.systemName,
                values.policeDeptCode || "",
                values.itDeptCode || "",
                logoFile
            );
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleAuthSave = async () => {
        try {
            const values = await authForm.validateFields();
            saveAuthConfig(values.appId, values.key);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const beforeUpload = (file: RcFile) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件!');
            return false;
        }
        
        // 保存文件对象以便后续上传
        setLogoFile(file);
        
        // 创建预览URL
        setSystemLogo(URL.createObjectURL(file));
        
        // 阻止自动上传
        return false;
    };

    // Define tabs items
    const tabItems = [
        {
            key: "system",
            label: "系统配置",
            children: (
                <Spin spinning={configLoading}>
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
                                    beforeUpload={beforeUpload}
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
                            <Button 
                                type="primary" 
                                onClick={handleSystemSave}
                                loading={savingConfig}
                            >
                                保存更改
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            )
        },
        {
            key: "oauth",
            label: "登录配置",
            children: (
                <Spin spinning={authLoading}>
                    <Form
                        form={authForm}
                        layout="vertical"
                        className="max-w-xl"
                        initialValues={{
                            appId: "",
                            key: ""
                        }}
                    >
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
                            <Button 
                                type="primary" 
                                onClick={handleAuthSave}
                                loading={savingAuthConfig}
                            >
                                保存更改
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            )
        }
    ];

    return (
        <div className="flex flex-col w-full box-border p-8 h-screen overflow-y-auto gap-4">
            <p className="font-bold text-2xl">系统设置</p>

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab} 
                className="w-full bg-white !px-8 box-border"
                items={tabItems}
            />
        </div>
    );
};

export default System;
