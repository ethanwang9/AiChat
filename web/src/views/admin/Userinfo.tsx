import {FC, useState, useEffect} from "react";
import {Button, message, Spin} from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    WechatOutlined,
    FileImageOutlined, DeleteOutlined
} from "@ant-design/icons";
import {GetAdminUserinfo} from "@/apis/admin";
import {HTTPAdminUserinfo} from "@/types/http/admin";
import {useMount, useRequest} from "ahooks";
import Visitors from "@/assets/icon/visitors.svg"


const Userinfo: FC = () => {
    // 初始化
    const [userInfo, setUserInfo] = useState<HTTPAdminUserinfo>({
        name: "",
        mail: "",
        phone: "",
        avatar: "",
        uid: 0
    });

    // 获取用户信息请求
    useRequest(GetAdminUserinfo, {
        onSuccess: (data: HTTPAdminUserinfo) => {
            setUserInfo(data);
        },
    });

    return (
        <div className="w-[650px] mx-auto box-border m-4 p-4">
            {/*标题*/}
            <p className="text-2xl font-bold">用户信息</p>
            <div className="bg-white box-border p-8 mt-8 rounded-lg">
                {/*头像*/}
                <div className="w-full  flex flex-col justify-center items-center gap-2 mb-10">
                    <img className="w-24 h-24 overflow-hidden rounded-full" src={userInfo.avatar || Visitors}
                         alt="用户头像"/>
                    <p className="text-xl font-bold">{userInfo.name || "无名氏"}</p>
                </div>
                {/*列表*/}
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <UserOutlined/>
                            <p>用户ID</p>
                        </div>
                        <p>{userInfo.uid}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <MailOutlined/>
                            <p>邮箱</p>
                        </div>
                        <p>{userInfo.mail || "未绑定邮箱"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <PhoneOutlined/>
                            <p>手机号</p>
                        </div>
                        <p>{userInfo.phone || "未绑定手机号"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <FileImageOutlined/>
                            <p>更换头像</p>
                        </div>
                        <Button type="primary">上传头像</Button>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <DeleteOutlined/>
                            <p>注销账号</p>
                        </div>
                        <Button color="danger" variant="solid">注销账号</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Userinfo;
