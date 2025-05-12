import {FC, useEffect, useState} from "react";
import {Card, Divider, Tabs, Spin} from "antd";
import {Outlet, useLocation, useNavigate} from "react-router";
import {useMount, useRequest} from "ahooks";
import {GetChatAgentCategory, GetChatAgentList} from "@/apis/chat";
import {HTTPChatAgentList} from "@/types/http/chat";

const Agent: FC = () => {
    // 初始化
    const [showChat, setShowChat] = useState(false);
    const [categories, setCategories] = useState<string[]>(["全部"]);
    const [currentCategory, setCurrentCategory] = useState<string>("全部");
    const [agentList, setAgentList] = useState<HTTPChatAgentList[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === "/service/agent/chat") {
            setShowChat(true);
        } else {
            setShowChat(false);
        }
    }, [location.pathname]);

    // 获取智能体分类
    const {loading: categoryLoading} = useRequest(
        () => GetChatAgentCategory(),
        {
            manual: false,
            onSuccess: (response) => {
                // 确保"全部"始终是第一个选项
                if (response && Array.isArray(response)) {
                    const allCategories = ["全部", ...response];
                    setCategories(allCategories);
                }
            }
        }
    );

    // 获取智能体列表
    const {loading: agentLoading, run: fetchAgentList} = useRequest(
        (category: string) => GetChatAgentList(category),
        {
            manual: true,
            onSuccess: (response) => {
                if (response && Array.isArray(response)) {
                    setAgentList(response);
                }
            }
        }
    );

    // 处理标签切换
    const handleTabChange = (key: string) => {
        setCurrentCategory(key);
        fetchAgentList(key);
    };

    // 处理智能体点击
    const handleAgentClick = (agentId: number) => {
        navigate(`/service/agent/chat?id=${agentId}`);
    };

    // 生命周期 - 挂载
    useMount(() => {
        // 初始化加载全部分类的智能体
        fetchAgentList("全部");
    });

    // 渲染智能体卡片列表
    const renderAgentCards = () => {
        if (agentLoading) {
            return (
                <div className="flex justify-center py-8">
                    <Spin size="large" />
                </div>
            );
        }

        if (agentList.length === 0) {
            return (
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">暂无智能体</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-3 gap-4">
                {agentList.map((agent) => (
                    <Card 
                        key={agent.id} 
                        hoverable 
                        onClick={() => handleAgentClick(agent.id)}
                        className="cursor-pointer"
                    >
                        <div className="flex gap-4">
                            <img
                                className="h-20 w-20 rounded-xl"
                                src={agent.avatar || "/logo.svg"}
                                alt={agent.name}
                            />
                            <div>
                                <p className="mb-2 line-clamp-1 text-base font-bold">
                                    {agent.name}
                                </p>
                                <p className="line-clamp-2 text-sm">
                                    {agent.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <>
            {!showChat ? (
                <div className="box-border flex w-full flex-col p-4">
                    {/*标题*/}
                    <div className="flex flex-col items-center justify-center p-4">
                        <p className="text-2xl font-bold text-blue-500">发现智能体</p>
                        <div className="w-1/2">
                            <Divider className="text-base text-gray-500">
                                探索各种具有专业指令和技能的智能体，协助你的生活和工作
                            </Divider>
                        </div>
                    </div>

                    {/*菜单*/}
                    <div className="px-16">
                        {categoryLoading ? (
                            <div className="flex justify-center py-8">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Tabs 
                                defaultActiveKey="全部"
                                activeKey={currentCategory}
                                onChange={handleTabChange}
                                items={categories.map(category => ({
                                    key: category,
                                    label: category,
                                    children: renderAgentCards()
                                }))}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <Outlet/>
            )}
        </>
    );
};

export default Agent;
