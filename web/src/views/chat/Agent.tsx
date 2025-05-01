import {FC} from "react";
import {Card, Divider, Tabs, TabsProps} from "antd";

const Agent: FC = () => {
    // 初始化

    // 卡片列表
    const card = (
        <div className="grid grid-cols-4 gap-4">
            <Card>
                <div className="flex gap-4">
                    <img className="w-20 h-20" src="/src/assets/avatar/1.jpg" alt="Agent"/>
                    <div>
                        <p className="font-bold text-base line-clamp-1 mb-2">市场分析专家</p>
                        <p className="text-sm line-clamp-2">专注于市场趋势分析，助您把握商业机遇专注于市场趋势分析，助您把握商业机遇专注于市场趋势分析，助您把握商业机遇</p>
                    </div>
                </div>
            </Card>
        </div>
    )

    // Tab
    const tab: TabsProps['items'] = [
        {
            key: '1',
            label: '全部',
            children: card,
        },
        {
            key: '2',
            label: '数据分析',
            children: card,
        },
        {
            key: '3',
            label: '编程开发',
            children: card,
        },
    ];

    return (
        <div className="flex flex-col w-full box-border p-4">
            {/*标题*/}
            <div className="flex flex-col justify-center items-center p-4">
                <p className="font-bold text-2xl text-blue-500">发现智能体</p>
                <div className="w-1/2">
                    <Divider
                        className="text-gray-500 text-base">探索各种具有专业指令和技能的智能体，协助你的生活和工作</Divider>
                </div>
            </div>

            {/*菜单*/}
            <div className="px-16">
                <Tabs defaultActiveKey="1" items={tab}/>
            </div>
        </div>
    );
};

export default Agent;
