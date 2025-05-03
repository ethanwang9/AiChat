import {FC, useState} from "react";
import {Button} from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    WechatOutlined,
    FileImageOutlined, DeleteOutlined
} from "@ant-design/icons";


const Userinfo: FC = () => {
    const [userInfo] = useState({
        name: "陈思远",
        mail: "siyuan.chen@example.com",
        phone: "138****5678",
        avatar: "/src/assets/avatar/1.jpg"
    });

    return (
        <div className="w-[650px] mx-auto box-border m-4 p-4">
            {/*标题*/}
            <p className="text-2xl font-bold">用户信息</p>
            <div className="bg-white box-border p-8 mt-8 rounded-lg">
                {/*头像*/}
                <div className="w-full  flex flex-col justify-center items-center gap-2 mb-10">
                    <img className="w-24 h-24 overflow-hidden rounded-full" src={userInfo.avatar} alt="用户头像"/>
                    <p className="text-xl font-bold">{userInfo.name}</p>
                </div>
                {/*列表*/}
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <UserOutlined/>
                            <p>用户名</p>
                        </div>
                        <p>{userInfo.name}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <MailOutlined/>
                            <p>邮箱</p>
                        </div>
                        <p>{userInfo.mail}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <PhoneOutlined/>
                            <p>手机号</p>
                        </div>
                        <p>{userInfo.phone}</p>
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
                            <WechatOutlined/>
                            <p>微信登录</p>
                        </div>
                        <Button>绑定账号</Button>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <DeleteOutlined/>
                            <p>注销账号</p>
                        </div>
                        <Button color="danger" variant="solid">绑定账号</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Userinfo;
