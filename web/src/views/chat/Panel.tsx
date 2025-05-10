import {FC, useState, useRef, useEffect} from "react";
import {Layout, List, Popover, Modal, QRCode} from "antd";
import {Outlet, useLocation, useNavigate} from "react-router";
import {
    LogoutOutlined,
    MessageOutlined,
    RedditOutlined,
    TrophyOutlined,
    UserOutlined,
    WechatOutlined,
} from "@ant-design/icons";
import IconWechat from "@/assets/icon/wechat.svg";
import {useUserStore} from "@/hooks/userHooks.ts";
import {useMount, useRequest, useUnmount} from "ahooks";
import {GetAuthCheck, GetAuthLogin} from "@/apis/auth";

const {Content, Sider} = Layout;

const ChatPanel: FC = () => {
    // react router 地址信息
    const location = useLocation();
    const navigate = useNavigate();
    // 导航栏名称
    const [navName, setNavName] = useState("");
    // 微信登录弹窗
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    // 微信登录二维码
    const [qr, setQr] = useState("");
    // 微信登录校验
    const loginCheckRef = useRef<NodeJS.Timeout | null>(null);
    // 用户信息
    const userStore = useUserStore();

    // 获取登录链接
    const {run: fetchLoginLink, loading: loginLinkLoading} = useRequest(GetAuthLogin, {
        manual: true,
        debounceWait: 800,
        onSuccess: (data: any) => {
            // 设置数据
            setQr(data?.link);
            // 开始轮询
            loginCheckRef.current = setInterval(() => {
                checkLogin(data.id);
            }, 1000);
        },
    });

    // 微信登录校验
    const {run: checkLogin} = useRequest((stateId: string) => GetAuthCheck(stateId), {
        manual: true,
        onSuccess: (data: any) => {
            if (data.status) {
                userStore.setRole(data.role);
                userStore.setToken(data.token);
                userStore.setAvatar(data.avatar)
                // 清除轮询
                if (loginCheckRef.current) {
                    clearInterval(loginCheckRef.current);
                    loginCheckRef.current = null;
                }
                // 清除qr
                setQr("")
                // 关闭弹窗
                setLoginModalOpen(false);
            }
        },
    });

    // 生命周期 - 销毁
    useUnmount(() => {
        if (loginCheckRef.current) {
            clearInterval(loginCheckRef.current);
            loginCheckRef.current = null;
        }
    })

    // 生命周期 - 挂载
    useMount(() => {
        if (location.pathname === "/service") {
            navigate("/service/chat");
        }
    });

    // 监听菜单栏变化
    useEffect(() => {
        const navArr = location.pathname.split("/");
        if (navArr.length === 3) {
            setNavName(navArr[navArr.length - 1]);
        }
    }, [location.pathname]);

    // 跳转到后台用户信息界面
    const goPage = (url: string) => {
        navigate(url);
    };

    // 退出用户登陆
    const logout = () => {
        userStore.logout();
        navigate("/");
    };

    // 打开登录弹窗
    const showLoginModal = () => {
        // 检查用户是否已登录，如果未登录则获取登录链接
        if (!userStore.user.token || userStore.user.token.length <= 0) {
            fetchLoginLink();
        }

        // 打开弹窗
        setLoginModalOpen(true);
    };

    // 关闭登录弹窗
    const closeLoginModal = () => {
        // 清除轮询
        if (loginCheckRef.current) {
            clearInterval(loginCheckRef.current);
            loginCheckRef.current = null;
        }
        // 清楚qr
        setQr("");
        setLoginModalOpen(false);
    };

    return (
        <Layout hasSider>
            <Sider width={70} theme="light">
                <div className="flex h-screen w-full flex-col items-center justify-between p-4">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex h-12 w-12 items-center justify-center">
                            <img src="/logo.svg" alt="LOGO" className="w-8"/>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-8">
                            <div
                                className={`flex flex-col items-center justify-center gap-2 ${navName === "chat" ? "text-blue-500" : ""}`}
                                onClick={() => goPage("/service/chat")}
                            >
                                <MessageOutlined className="text-xl"/>
                                <span className="text-xs">对话</span>
                            </div>
                            <div
                                className={`flex flex-col items-center justify-center gap-2 ${navName === "agent" ? "text-blue-500" : ""}`}
                                onClick={() => goPage("/service/agent")}
                            >
                                <RedditOutlined className="text-xl"/>
                                <span className="text-xs">智能体</span>
                            </div>
                            <div
                                className={`flex flex-col items-center justify-center gap-2 ${navName === "pk" ? "text-blue-500" : ""}`}
                                onClick={() => goPage("/service/pk")}
                            >
                                <TrophyOutlined className="text-xl"/>
                                <span className="text-xs">擂台</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                        <Popover
                            placement="right"
                            trigger="click"
                            content={
                                <List>
                                    {!userStore.user.token || userStore.user.token.length <= 0 ? (
                                        <List.Item
                                            className="mx-4 cursor-pointer"
                                            onClick={showLoginModal}
                                        >
                                            <WechatOutlined/>
                                            <span className="pl-2">登陆账号</span>
                                        </List.Item>
                                    ) : (
                                        <>
                                            <List.Item
                                                className="mx-4"
                                                onClick={() => goPage("/admin/userinfo")}
                                            >
                                                <UserOutlined/>
                                                <span className="pl-2">个人信息</span>
                                            </List.Item>
                                            <List.Item className="mx-4" onClick={logout}>
                                                <LogoutOutlined/>
                                                <span className="pl-2">退出登陆</span>
                                            </List.Item>
                                        </>
                                    )}
                                </List>
                            }
                        >
                            <img src={userStore.user.avatar} alt="LOGO"/>
                        </Popover>
                    </div>
                </div>
            </Sider>
            <Content>
                <Outlet/>
            </Content>

            {/* 微信登录弹窗 */}
            <Modal
                className="!w-80"
                open={loginModalOpen}
                onCancel={closeLoginModal}
                footer={null}
                centered
            >
                <div className="flex flex-col items-center py-10">
                    {loginLinkLoading ? (
                        <div className="flex items-center justify-center h-[180px] w-[180px]">
                            <span>加载中...</span>
                        </div>
                    ) : (
                        <QRCode
                            className="shadow-md"
                            icon={IconWechat}
                            iconSize={{width: 45, height: 45}}
                            errorLevel="M"
                            value={qr}
                            size={180}
                        />
                    )}
                    <p className="mt-6 text-gray-700">微信扫一扫即可登录</p>
                </div>
            </Modal>
        </Layout>
    );
};

export default ChatPanel;
