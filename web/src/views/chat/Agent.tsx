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
        <div className="grid grid-cols-3 gap-4">
            <Card>
                <div className="flex gap-4">
                    <img
                        className="h-20 w-20"
                        src="/src/assets/avatar/2.png"
                        alt="Agent"
                    />
                    <div>
                        <p className="mb-2 line-clamp-1 text-base font-bold">
                        爆炸标题党
                        </p>
                        <p className="line-clamp-2 text-sm">
                        Boooom！炸裂的标题诞生！
                        </p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex gap-4">
                    <img
                        className="h-20 w-20"
                        src="/src/assets/avatar/3.png"
                        alt="Agent"
                    />
                    <div>
                        <p className="mb-2 line-clamp-1 text-base font-bold">
                        AI编码助手
                        </p>
                        <p className="line-clamp-2 text-sm">
                        你好，我是你的 AI 编码助手，我能帮你写代码、写注释、写单元测试，帮你读代码、排查代码问题等。快来考考我吧！
                        </p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex gap-4">
                    <img
                        className="h-20 w-20"
                        src="/src/assets/avatar/4.png"
                        alt="Agent"
                    />
                    <div>
                        <p className="mb-2 line-clamp-1 text-base font-bold">
                        小红书文案大师
                        </p>
                        <p className="line-clamp-2 text-sm">
                        精通小红书爆款文案创作
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
                            <TabPane tab="文本编辑" key="2">
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
