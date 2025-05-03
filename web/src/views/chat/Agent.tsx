import {FC, useEffect, useState} from "react";
import {Card, Divider, Tabs} from "antd";
import {Outlet, useLocation} from "react-router";

const {TabPane} = Tabs;

const Agent: FC = () => {
    // 初始化
    const [showChat, setShowChat] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/service/agent/chat") {
            setShowChat(true);
        } else {
            setShowChat(false);
        }
    }, [location.pathname]);

    // 卡片列表
    const card = (
        <div className="grid grid-cols-4 gap-4">
            <Card>
                <div className="flex gap-4">
                    <img
                        className="h-20 w-20"
                        src="/src/assets/avatar/1.jpg"
                        alt="Agent"
                    />
                    <div>
                        <p className="mb-2 line-clamp-1 text-base font-bold">
                            市场分析专家
                        </p>
                        <p className="line-clamp-2 text-sm">
                            专注于市场趋势分析，助您把握商业机遇专注于市场趋势分析，助您把握商业机遇专注于市场趋势分析，助您把握商业机遇
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );

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
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="全部" key="1">
                                {card}
                            </TabPane>
                            <TabPane tab="数据分析" key="2">
                                {card}
                            </TabPane>
                            <TabPane tab="编程开发" key="3">
                                {card}
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            ) : (
                <Outlet/>
            )}
        </>
    );
};

export default Agent;
