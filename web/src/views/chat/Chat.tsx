import {FC, useEffect, useState} from "react";
import {PlusOutlined} from "@ant-design/icons";
import {Button, Divider, Flex, GetProp, message, Select, Switch, Typography} from "antd";
import {Bubble, Conversations, ConversationsProps, Sender, XRequest} from "@ant-design/x";
import {useMount} from "ahooks";

const streamRequest = XRequest({
    baseURL: "/api/v1/chat/chat",
    fetch: async (baseURL, data) => {
        const body = Object.entries(JSON.parse(data?.body as string) as string).map(([key, value]) => {
            if (key === "history") {
                return `${key}=${JSON.stringify(value)}`;
            } else {
                return `${key}=${value}`
            }
        }).join("&")
        const token = JSON.parse(localStorage.getItem("user") as string)?.token || "";
        return await fetch(baseURL, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body,
        })
    },
});

interface RequestParams {
    channel: number;
    model: string;
    history: Array<Record<string, string>>;
}

const Chat: FC = () => {
    // 初始化
    const [inputStatus, setInputStatus] = useState<boolean>(false)
    const [inputLoading, setInputLoading] = useState<boolean>(false)
    const [inputValue, setInputValue] = useState<string>("")
    const [streamValue, setStreamValue] = useState<string>("")

    // 历史对话记录
    const items: GetProp<ConversationsProps, 'items'> = Array.from({length: 1}).map((_, index) => ({
        key: `item${index + 1}`,
        label: `hi，你是谁？`,
    }));

    // 发起对话请求
    useMount(() =>
        streamRequest.create<RequestParams>(
            {
                channel: 1,
                model: "DeepSeek-V3",
                history: [
                    {
                        "role": "user",
                        "content": "生成一道高中数学几何题并尝试解答",
                    }
                ],
            },
            {
                onSuccess: (msg) => {
                    console.log('onSuccess', msg);
                },
                onError: (error) => {
                    console.error('onError', error);
                },
                onUpdate: (msg) => {
                    // console.log('onUpdate', msg);
                    if (msg.code != undefined && msg.code === 301) {
                        // 处理错误
                        message.error({
                            content: msg.message
                        })
                    } else {
                        // 处理返回消息
                        const {content} = JSON.parse(msg.data)
                        setStreamValue(value => value + content)
                    }
                },
            },
        )
    )


    // 加载状态
    useEffect(() => {
        if (inputLoading) {
            const timer = setTimeout(() => {
                setInputLoading(false);
                setInputStatus('');
                console.log('Send message successfully!');
            }, 200000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [inputLoading]);


    return (
        <div className="flex h-screen w-full">
            <div className="w-[300px] h-full bg-white box-border p-4">
                <Button icon={<PlusOutlined/>} type="primary" className="w-full">新建对话</Button>
                <div className="w-full h-[calc(100vh-32px-16px-16px)] overflow-y-auto">
                    <Conversations className="w-full" items={items} defaultActiveKey="item1"/>
                </div>
            </div>
            <div className="flex flex-col gap-4 flex-1 h-full box-border p-4 bg-gray-100">
                {/*标题*/}
                <div className="flex items-center w-full h-[60px]">
                    <p className="text-lg">hi，你是谁？</p>
                </div>
                {/*对话气泡*/}
                <div className="flex-auto overflow-y-auto">
                    <Flex gap="middle" vertical>
                        <Bubble
                            placement="end"
                            content="hi，你是谁？"
                            avatar={<img className="w-8 h-8" src="/src/assets/avatar/1.jpg"/>}
                        />
                        <Bubble
                            placement="start"
                            content={streamValue}
                            avatar={<img className="w-8 h-8" src="/logo.svg"/>}
                            typing={{ step: 2, interval: 50 }}
                        />
                    </Flex>
                </div>
                {/*输入框*/}
                <div>
                    <Sender
                        className="bg-white"
                        value={inputValue}
                        onChange={setInputValue}
                        disabled={inputStatus}
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
                                        {inputLoading ? (
                                            <LoadingButton type="default"/>
                                        ) : (
                                            <SendButton type="primary" disabled={false}/>
                                        )}
                                    </Flex>
                                </Flex>
                            );
                        }}
                        onSubmit={() => {
                            setInputLoading(true);
                        }}
                        onCancel={() => {
                            setInputLoading(false);
                        }}
                        actions={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;
