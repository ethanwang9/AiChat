import {FC, useEffect, useState} from "react";
import {Card, Divider, Dropdown, Flex, MenuProps} from "antd";
import {Bubble, Sender} from "@ant-design/x";
import {DownOutlined} from "@ant-design/icons";

const PK: FC = () => {
    // 初始化
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');

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

    // pk模型列表
    const items: MenuProps['items'] = [
        {
            label: (
                <p>hello</p>
            ),
            key: '0',
        },
    ];

    return (
        <div className="flex flex-col h-screen w-full gap-4 box-border p-4">
            <div className="flex flex-auto gap-4 w-full">
                <Card className="flex-1/2 bg-red-400">
                    <Dropdown menu={{items}} trigger={['click']}>
                        <a
                            className="font-bold flex gap-4 pb-2"
                            onClick={(e) => e.preventDefault()}
                        >
                            <p>DeepSeek-V3</p>
                            <DownOutlined/>
                        </a>
                    </Dropdown>
                    <div className="w-full h-[calc(100vh-22px-16px-16px-24px-24px-138px-16px-8px)] overflow-y-auto">
                        <Flex gap="middle" vertical>
                            <Bubble
                                placement="end"
                                content="今天重庆天气怎么样！"
                                avatar={<img className="w-8 h-8" src="/src/assets/avatar/1.jpg" alt="头像"/>}
                            />
                            <Bubble
                                placement="start"
                                content="根据墨迹天气的信息，重庆今天（5 月 1 日）的天气是多云，最低温度 19℃，最高温度 31℃，空气质量良，pm2.5 指数 40，湿度 41，东南风 2 级。"
                                avatar={<img className="w-8 h-8" src="/logo.svg" alt="头像"/>}
                            />
                        </Flex>
                    </div>
                </Card>
                <Card className="flex-1/2 bg-red-400">
                    <Dropdown menu={{items}} trigger={['click']}>
                        <a
                            className="font-bold flex gap-4 pb-2"
                            onClick={(e) => e.preventDefault()}
                        >
                            <p>DeepSeek-V3</p>
                            <DownOutlined/>
                        </a>
                    </Dropdown>
                    <div className="w-full h-[calc(100vh-22px-16px-16px-24px-24px-138px-16px-8px)] overflow-y-auto">
                        <Flex gap="middle" vertical>
                            <Bubble
                                placement="end"
                                content="今天重庆天气怎么样！"
                                avatar={<img className="w-8 h-8" src="/src/assets/avatar/1.jpg" alt="头像"/>}
                            />
                            <Bubble
                                placement="start"
                                content="根据墨迹天气的信息，重庆今天（5 月 1 日）的天气是多云，最低温度 19℃，最高温度 31℃，空气质量良，pm2.5 指数 40，湿度 41，东南风 2 级。"
                                avatar={<img className="w-8 h-8" src="/logo.svg" alt="头像"/>}
                            />
                        </Flex>
                    </div>
                </Card>
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
                            <Flex justify="flex-end" align="center">
                                <SpeechButton/>
                                <Divider type="vertical"/>
                                {loading ? (
                                    <LoadingButton type="default"/>
                                ) : (
                                    <SendButton type="primary" disabled={false}/>
                                )}
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
    );
};

export default PK;
