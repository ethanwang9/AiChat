import {FC, useEffect, useState} from "react";
import {Layout, List, Popover} from "antd";
import {Outlet, useLocation, useNavigate} from "react-router";
import Avatar from "@/assets/avatar/1.jpg";
import {
    LogoutOutlined,
    MessageOutlined,
    RedditOutlined,
    TrophyOutlined,
    UserOutlined,
    WechatOutlined
} from "@ant-design/icons";

const {Content, Sider} = Layout;

const ChatPanel: FC = () => {
    // 初始化
    const location = useLocation();
    const navigate = useNavigate();
    const [navName, setNavName] = useState("")

    // 监听默认地址
    useEffect(() => {
        if (location.pathname === "/service") {
            navigate("/service/chat");
        }
        const navArr = location.pathname.split("/")
        setNavName(navArr[navArr.length - 1])
    }, [location.pathname, navigate]);

    // 跳转到后台用户信息界面
    const goPage = (url: string) => {
        navigate(url)
    }

    // 退出用户登陆
    const logout = () => {

    }

    return (
        <Layout hasSider>
            <Sider width={70} theme="light">
                <div className="flex flex-col justify-between items-center h-screen w-full p-4">
                    <div className="flex flex-col items-center gap-8">
                        <div className="w-12 h-12 flex justify-center items-center">
                            <img src="/logo.svg" alt="LOGO" className="w-8"/>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-8">
                            <div
                                className={`flex flex-col justify-center items-center gap-2 ${navName === 'chat' ? 'text-blue-500' : ''}`}
                                onClick={() => goPage("/service/chat")}
                            >
                                <MessageOutlined className="text-xl"/>
                                <span className="text-xs">对话</span>
                            </div>
                            <div
                                className={`flex flex-col justify-center items-center gap-2 ${navName === 'agent' ? 'text-blue-500' : ''}`}
                                onClick={() => goPage("/service/agent")}
                            >
                                <RedditOutlined className="text-xl"/>
                                <span className="text-xs">智能体</span>
                            </div>
                            <div
                                className={`flex flex-col justify-center items-center gap-2 ${navName === 'pk' ? 'text-blue-500' : ''}`}
                                onClick={() => goPage("/service/pk")}
                            >
                                <TrophyOutlined className="text-xl"/>
                                <span className="text-xs">擂台</span>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-full overflow-hidden w-10 h-10">
                        <Popover placement="right" trigger="click" content={
                            <List>
                                <List.Item className="mx-4">
                                    <WechatOutlined />
                                    <span className="pl-2">登陆账号</span>
                                </List.Item>
                                <List.Item className="mx-4" onClick={() => goPage("/admin/userinfo")}>
                                    <UserOutlined/>
                                    <span className="pl-2">个人信息</span>
                                </List.Item>
                                <List.Item className="mx-4" onClick={logout}>
                                    <LogoutOutlined/>
                                    <span className="pl-2">退出登陆</span>
                                </List.Item>
                            </List>
                        }>
                            <img src={Avatar} alt="LOGO"/>
                        </Popover>
                    </div>
                </div>
            </Sider>
            <Content>
                <Outlet/>
            </Content>
        </Layout>
    );
};

export default ChatPanel;
