import {FC, useEffect, useState} from "react";
import {PlusOutlined} from "@ant-design/icons";
import {Button, Divider, Flex, GetProp, Select, Switch} from "antd";
import {Bubble, Conversations, ConversationsProps, Sender} from "@ant-design/x";

const Chat: FC = () => {
    // 初始化
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');

    // 历史对话记录
    const items: GetProp<ConversationsProps, 'items'> = Array.from({length: 1}).map((_, index) => ({
        key: `item${index + 1}`,
        label: `今天重庆天气怎么样！`,
    }));

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


    return (
        <div className="flex h-screen w-full">
            <div className="w-[300px] h-full bg-white box-border p-4">
                <Button icon={<PlusOutlined/>} type="primary" className="w-full">新建对话</Button>
                <div className="w-full h-[calc(100vh-32px-16px-16px)] overflow-y-auto">
                    <Conversations className="w-full" items={items} defaultActiveKey="item1"/>
                </div>
            </div>
            <div className="flex flex-col gap-4 flex-auto h-full box-border p-4 bg-gray-100">
                {/*标题*/}
                <div className="flex items-center w-full h-[60px]">
                    <p className="text-lg">今天重庆天气怎么样！</p>
                </div>
                {/*对话气泡*/}
                <div className="flex-auto overflow-y-auto">
                    <Flex gap="middle" vertical>
                        <Bubble
                            placement="end"
                            content="今天重庆天气怎么样！"
                            avatar={<img className="w-8 h-8" src="/src/assets/avatar/1.jpg"/>}
                        />
                        <Bubble
                            placement="start"
                            content="根据墨迹天气的信息，重庆今天（5 月 1 日）的天气是多云，最低温度 19℃，最高温度 31℃，空气质量良，pm2.5 指数 40，湿度 41，东南风 2 级。"
                            avatar={<img className="w-8 h-8" src="/logo.svg"/>}
                        />
                    </Flex>
                </div>
                {/*输入框*/}
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

export default Chat;
