import {FC, useEffect, useState} from "react";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {Button, Divider, Flex, Select, Switch} from "antd";
import {Bubble, Sender} from "@ant-design/x";
import {useNavigate} from "react-router";

const AgentChat: FC = () => {
    // 初始化
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
    const navigate = useNavigate();

    // 加载状态
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
                setValue('');
                console.log('Send message successfully!');
            }, 2000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [loading]);

    // 返回智能体页面
    const goPageAgent = () => {
        navigate('/service/agent');
    }

    return (
        <div className="flex h-full w-full gap-4 overflow-hidden p-4">
            <div className="box-border flex h-full flex-6/24 flex-col items-center justify-center gap-4 bg-white p-8">
                <img
                    className="h-16 w-16 overflow-hidden rounded-full"
                    src="/src/assets/avatar/1.jpg"
                    alt="LOGO"
                />
                <p className="font-bold text-xl line-clamp-1">市场分析专家</p>
                <p className="text-sm leading-6 text-gray-800 mt-10 bg-blue-100 p-4 rounded-lg line-clamp-5">
                    我是一个市场分析专家，我对于市场分析非常在行哦！有任何问题都可以向我提问，我都会为你解答。
                </p>
            </div>
            <div className="flex flex-col h-full flex-18/24 bg-white box-border p-4">
                <div className="flex items-center gap-4">
                    <Button shape="circle" icon={<ArrowLeftOutlined/>} onClick={goPageAgent}></Button>
                    <p>市场分析专家</p>
                </div>
                <div className="flex-auto overflow-y-auto">
                    <Flex gap="middle" vertical>
                        <Bubble
                            placement="end"
                            content="今天重庆天气怎么样！"
                            avatar={<img className="w-8 h-8" src="/src/assets/avatar/1.jpg" alt="Avatar"/>}
                        />
                        <Bubble
                            placement="start"
                            content="根据墨迹天气的信息，重庆今天（5 月 1 日）的天气是多云，最低温度 19℃，最高温度 31℃，空气质量良，pm2.5 指数 40，湿度 41，东南风 2 级。"
                            avatar={<img className="w-8 h-8" src="/logo.svg"/>}
                        />
                    </Flex>
                </div>
                <div>
                    <Sender
                        className="bg-white"
                        value={value}
                        onChange={setValue}
                        autoSize={{minRows: 3, maxRows: 15}}
                        placeholder="有任何问题都可以向小恐龙提问"
                        footer={({components}) => {
                            const {SendButton, LoadingButton, SpeechButton} = components;
                            return (
                                <Flex justify="space-between" align="center">
                                    <Flex gap="small" align="center">
                                        <Select
                                            defaultValue="d"
                                            options={[
                                                {value: 'd', label: <span>DeepSeek-R1</span>},
                                                {value: 'c', label: <span>ChatGPT</span>}
                                            ]}
                                        />
                                        <Divider type="vertical"/>
                                        <span>深度思考</span>
                                        <Switch size="small"/>
                                    </Flex>
                                    <Flex align="center">
                                        <SpeechButton/>
                                        <Divider type="vertical"/>
                                        {loading ? (
                                            <LoadingButton type="default"/>
                                        ) : (
                                            <SendButton type="primary" disabled={false}/>
                                        )}
                                    </Flex>
                                </Flex>
                            );
                        }}
                        onSubmit={() => {
                            setLoading(true);
                        }}
                        onCancel={() => {
                            setLoading(false);
                        }}
                        actions={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default AgentChat;
