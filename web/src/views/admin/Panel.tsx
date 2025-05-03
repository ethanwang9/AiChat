import {FC, useEffect, useState} from "react";
import {Button, Divider, Layout, Menu, MenuProps,} from "antd";
import {Outlet, useLocation, useNavigate} from "react-router";
import {
    AliwangwangOutlined, ArrowLeftOutlined,
    ContactsOutlined, ControlOutlined, DatabaseOutlined,
    FileSearchOutlined,
    LogoutOutlined,
    PieChartOutlined,
    RedditOutlined, RobotOutlined,
    UserOutlined,
} from "@ant-design/icons";

const {Content, Sider} = Layout;
type MenuItem = Required<MenuProps>['items'][number];


const AdminPanel: FC = () => {
    // 初始化
    const location = useLocation();
    const navigate = useNavigate();
    const [navName, setNavName] = useState("")

    // 监听默认地址
    useEffect(() => {
        if (location.pathname === "/admin") {
            navigate("/admin/userinfo");
        }
        const navArr = location.pathname.split("/")
        setNavName(navArr[navArr.length - 1])
    }, [location.pathname, navigate]);

    // 跳转页面
    const goPage = (url: string) => {
        navigate(url)
    }

    // 退出用户登陆
    const logout = () => {

    }

    // 导航菜单
    const items: MenuItem[] = [
        {
            key: "/service/chat",
            label: "返回对话",
            icon: <ArrowLeftOutlined />,
        },
        {
            key: 'personal',
            label: '个人信息',
            type: 'group',
            children: [
                {key: 'userinfo', label: '用户信息', icon: <UserOutlined/>},
                {key: 'history', label: '历史对话记录', icon: <FileSearchOutlined/>},
            ],
        },
        {
            key: 'system',
            label: '系统管理',
            type: 'group',
            children: [
                {key: 'dashboard', label: '仪表盘', icon: <PieChartOutlined/>},
                {key: 'agent', label: '智能体', icon: <RedditOutlined/>},
                {key: 'chat', label: '对话管理', icon: <AliwangwangOutlined/>},
                {key: 'model', label: '模型管理', icon: <RobotOutlined/>},
                {key: 'user', label: '用户管理', icon: <ContactsOutlined/>},
                {key: 'log', label: '日志管理', icon: <DatabaseOutlined/>},
                {key: 'system', label: '系统设置', icon: <ControlOutlined/>},
            ],
        },
    ];

    return (
        <Layout hasSider>
            <Sider width={260} theme="light"
                   className="bg-white h-screen box-border p-4">
                <div className="flex flex-col h-full justify-between items-center">
                    <div className="flex flex-col justify-center items-center gap-8">
                        {/*LOGO*/}
                        <div className="flex items-center gap-4 justify-center">
                            <img className="w-10" src="/logo.svg" alt="LOGO"/>
                            <p className="font-bold text-3xl">DinoPals</p>
                        </div>
                        {/*菜单*/}
                        <Menu
                            className="w-[calc(260px-32px)] !border-e-0"
                            mode="vertical"
                            items={items}
                            selectedKeys={[navName]}
                            onClick={(e) => goPage(e.key)}
                        />
                    </div>
                    {/*退出登陆*/}
                    <div className="w-full">
                        <Divider/>
                        <Button
                            className="w-full"
                            icon={<LogoutOutlined/>}
                            color="danger"
                            variant="filled"
                            onClick={logout}
                        >退出登录</Button>
                    </div>
                </div>
            </Sider>
            <Content className="bg-gray-100">
                <Outlet/>
            </Content>
        </Layout>
    );
};

export default AdminPanel;
