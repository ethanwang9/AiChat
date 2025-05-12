import { FC, useState } from "react";
import { Button, Upload, message, Modal } from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    FileImageOutlined, DeleteOutlined
} from "@ant-design/icons";
import { GetAdminUserinfo, UploadAdminUserAvatar, DeleteAdminUser } from "@/apis/admin";
import { HTTPAdminUserinfo } from "@/types/http/admin";
import { useMount, useRequest } from "ahooks";
import Visitors from "@/assets/icon/visitors.svg"
import type { RcFile } from 'antd/es/upload/interface';
import { useUserStore } from "@/hooks/userHooks";

const Userinfo: FC = () => {
    // 初始化
    const [userInfo, setUserInfo] = useState<HTTPAdminUserinfo>({
        name: "",
        mail: "",
        phone: "",
        avatar: "",
        uid: 0
    });
    const userStore = useUserStore();

    // 获取用户信息请求
    const { run: fetchUserInfo } = useRequest(GetAdminUserinfo, {
        manual: true,
        onSuccess: (result) => {
            setUserInfo(result);
        },
    });

    // 上传头像请求
    const { loading: uploading, run: uploadAvatar } = useRequest(UploadAdminUserAvatar, {
        manual: true,
        onSuccess: () => {
            message.success('头像上传成功');
            fetchUserInfo()
        },
        onError: () => {
            message.error('头像上传失败');
        }
    });

    // 注销账号请求
    const { loading: deleting, run: deleteAccount } = useRequest(DeleteAdminUser, {
        manual: true,
        onSuccess: () => {
            message.success('账号已注销');
            userStore.logout();
            window.location.href = '/';
        },
        onError: () => {
            message.error('注销账号失败');
        }
    });

    // 上传前检查
    const beforeUpload = (file: RcFile) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件!');
        }

        uploadAvatar(file);
        return false; // 阻止自动上传
    };

    // 处理注销账号
    const handleDeleteAccount = () => {
        Modal.confirm({
            title: '高危操作',
            content: '注销后账号将无法恢复，确定要继续吗？',
            okText: '确认注销',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                deleteAccount();
            }
        });
    };

    // 挂载
    useMount(() => {
        fetchUserInfo()
    })

    return (
        <div className="w-[650px] mx-auto box-border m-4 p-4">
            {/*标题*/}
            <p className="text-2xl font-bold">用户信息</p>
            <div className="bg-white box-border p-8 mt-8 rounded-lg">
                {/*头像*/}
                <div className="w-full  flex flex-col justify-center items-center gap-2 mb-10">
                    <img className="w-24 h-24 overflow-hidden rounded-full" src={userInfo.avatar || Visitors}
                        alt="用户头像" />
                    <p className="text-xl font-bold">{userInfo.name || "无名氏"}</p>
                </div>
                {/*列表*/}
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <UserOutlined />
                            <p>用户ID</p>
                        </div>
                        <p>{userInfo.uid}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <MailOutlined />
                            <p>邮箱</p>
                        </div>
                        <p>{userInfo.mail || "未绑定邮箱"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <PhoneOutlined />
                            <p>手机号</p>
                        </div>
                        <p>{userInfo.phone || "未绑定手机号"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <FileImageOutlined />
                            <p>更换头像</p>
                        </div>
                        <Upload
                            beforeUpload={beforeUpload}
                            showUploadList={false}
                        >
                            <Button type="primary" loading={uploading}>上传头像</Button>
                        </Upload>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <DeleteOutlined />
                            <p>注销账号</p>
                        </div>
                        <Button danger onClick={handleDeleteAccount} loading={deleting}>注销账号</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Userinfo;
