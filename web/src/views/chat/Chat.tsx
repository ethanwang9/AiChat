import {FC, useState, useRef} from "react";
import {PlusOutlined} from "@ant-design/icons";
import {Button, Divider, Flex, GetProp, message, Select} from "antd";
import {Bubble, BubbleProps, Conversations, ConversationsProps, Sender} from "@ant-design/x";
import {useMount, useRequest} from "ahooks";
import {streamRequest, SSEResponse} from "@/utils/sse.ts";
import {ChatRequestParams, HttpModelList} from "@/types/http/chat.ts";
import AIResponse from "@/components/chat/AIResponse";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import {GetChatHistory, GetChatHistoryList, GetModelList, PostChatHistory} from "@/apis/chat.ts";
import {v4 as uuidv4} from 'uuid';
import {useUserStore} from "@/hooks/userHooks.ts";

const renderMarkdown: BubbleProps['messageRender'] = (content) => {
    return <MarkdownRenderer content={content}/>;
};

// 定义聊天消息类型
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    thinking?: string;
    isStreaming?: boolean;
}

// 定义历史记录项类型
const Chat: FC = () => {
    // Sender组件状态
    const [inputStatus, setInputStatus] = useState<boolean>(false);
    const [inputLoading, setInputLoading] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [modelType, setModelType] = useState<string>("登录账号后查看");
    const [modelList, setModelList] = useState<HttpModelList[]>([]);

    // 聊天历史状态
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [currentTitle, setCurrentTitle] = useState<string>("新的对话");
    const [groupId, setGroupId] = useState<string>("");

    // 历史对话列表
    const [historyItems, setHistoryItems] = useState<GetProp<ConversationsProps, 'items'>>([]);

    // 当前正在流式响应的内容
    const [, setStreamThink] = useState<string>("");
    const [, setStreamContent] = useState<string>("");
    const [isReceivingResponse, setIsReceivingResponse] = useState<boolean>(false);

    // Sender组件引用
    const senderRef = useRef<any>(null);

    // 获取用户信息
    const userStore = useUserStore()

    // 获取模型列表
    const {run: fetchModelList} = useRequest(GetModelList, {
        manual: true,
        debounceWait: 800,
        onSuccess: (data: any) => {
            setModelList(data)
            setModelType(data[0].model_nickname)
        },
    });

    // 获取历史记录
    const {run: fetchChatHistory} = useRequest(GetChatHistory, {
        manual: true,
        onSuccess: (data: any) => {
            const newItems: GetProp<ConversationsProps, 'items'> = data.map((item: any) => ({
                key: item.group_id,
                label: item.title,
            }));
            setHistoryItems(newItems);
        },
    });

    // 获取指定历史记录
    const {run: fetchChatHistoryList} = useRequest((id: string) => GetChatHistoryList(id), {
        manual: true,
        onSuccess: (response: any) => {
            if (response && response.length > 0) {
                // 设置对话标题
                const title = historyItems.find(item => item.key === groupId)?.label || "加载的对话";
                setCurrentTitle(title as string);

                // 更新聊天记录
                setChatHistory(response);
            }

        },
    });

    // 上报历史对话记录
    const {run: uploadHistory} = useRequest((
        group_id: string,
        title: string,
        question: string,
        answer: string
    ) => PostChatHistory(
        group_id,
        title,
        question,
        answer,
    ), {
        manual: true,
        onSuccess: () => {
            // 重新获取历史记录
            fetchChatHistory();
        }
    });

    // 加载特定对话
    const loadConversation = (groupId: string) => {
        // 设置当前分组ID
        setGroupId(groupId);

        // 获取特定对话的历史消息
        fetchChatHistoryList(groupId);
    };

    // 发送聊天请求
    const sendChatRequest = (userMessage: string) => {
        // 添加用户消息到历史记录
        const newUserMessage: ChatMessage = {
            role: 'user',
            content: userMessage
        };

        // 先添加用户消息
        setChatHistory(prev => [...prev, newUserMessage]);

        // 添加一个空的AI消息占位，用于流式更新
        const placeholderAIMessage: ChatMessage = {
            role: 'assistant',
            content: '',
            thinking: '',
            isStreaming: true
        };

        // 更新聊天历史，包含用户消息和占位AI消息
        setChatHistory(prev => [...prev, placeholderAIMessage]);

        // 清空之前的响应流
        setStreamThink("");
        setStreamContent("");
        setIsReceivingResponse(true);

        // 生成或使用现有的 groupId
        let currentGroupId = groupId;
        if (chatHistory.length === 0) {
            currentGroupId = uuidv4().replace(/-/g, '');
            setGroupId(currentGroupId);
        }

        // 构造请求参数 - 只包含历史消息，不包含占位消息
        const chatParams: ChatRequestParams = {
            channel: 1, // 使用当前选择的模型通道
            model: modelType, // 直接使用选择的模型名称
            question: userMessage,
            gid: currentGroupId,
        };

        // 发送请求
        streamRequest.create<ChatRequestParams>(
            chatParams,
            {
                onSuccess: () => {
                    // 请求成功完成，更新AI消息的状态
                    setChatHistory(prev => {
                        const updated = [...prev];
                        // 更新最后一条消息（AI消息）为完成状态
                        if (updated.length > 0) {
                            const lastMsg = updated[updated.length - 1];
                            if (lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                                lastMsg.isStreaming = false;
                            }
                        }

                        // 如果是第一条消息，更新对话标题
                        let messageTitle = currentTitle;
                        if (chatHistory.length <= 1) {
                            messageTitle = userMessage.length > 20 ? userMessage.substring(0, 20) + '...' : userMessage;
                            setCurrentTitle(messageTitle);
                        }

                        // 上报历史对话记录
                        const lastAIMessage = updated[updated.length - 1];
                        uploadHistory(
                            currentGroupId,
                            messageTitle,
                            userMessage,
                            lastAIMessage.content,
                        );

                        return updated;
                    });

                    setInputLoading(false);
                    setInputStatus(false);
                    setIsReceivingResponse(false);
                },
                onError: () => {
                    // 移除占位AI消息
                    setChatHistory(prev => prev.filter(msg => !msg.isStreaming));

                    setInputLoading(false);
                    setInputStatus(false);
                    setIsReceivingResponse(false);
                    message.error("请求失败，请稍后重试");
                },
                onUpdate: (msg: SSEResponse) => {
                    // 处理返回的消息
                    if (msg.code !== undefined && (msg.code === 301 || msg.code === 300)) {
                        // 处理错误
                        message.error({
                            content: msg.message
                        });

                        // 移除占位AI消息
                        setChatHistory(prev => prev.filter(msg => !msg.isStreaming));

                        setInputLoading(false);
                        setInputStatus(false);
                        setIsReceivingResponse(false);
                    } else if (msg.data) {
                        try {
                            // 处理返回消息
                            const {content, think} = JSON.parse(msg.data);

                            // 更新流式内容，用于显示
                            if (think !== undefined) {
                                setStreamThink(prev => prev + think);

                                // 同时更新历史记录中最后一条AI消息的思考内容
                                setChatHistory(prev => {
                                    const updated = [...prev];
                                    if (updated.length > 0) {
                                        const lastMsg = updated[updated.length - 1];
                                        if (lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                                            lastMsg.thinking = (lastMsg.thinking || '') + think;
                                        }
                                    }
                                    return updated;
                                });
                            } else if (content !== undefined) {
                                setStreamContent(prev => prev + content);

                                // 同时更新历史记录中最后一条AI消息的内容
                                setChatHistory(prev => {
                                    const updated = [...prev];
                                    if (updated.length > 0) {
                                        const lastMsg = updated[updated.length - 1];
                                        if (lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                                            lastMsg.content = (lastMsg.content || '') + content;
                                        }
                                    }
                                    return updated;
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing message data:', e);
                        }
                    }
                },
            },
        );
    };

    // 组件挂载时执行
    useMount(() => {
        // 获取模型列表
        fetchModelList();

        // 获取历史对话记录
        fetchChatHistory();
    });

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <div className="w-[300px] h-full bg-white box-border p-4">
                <Button icon={<PlusOutlined/>} type="primary" className="w-full"
                        onClick={() => {
                            // 清空当前对话，开始新的对话
                            setChatHistory([]);
                            setStreamThink("");
                            setStreamContent("");
                            setCurrentTitle("新的对话");
                            setInputValue("");
                            setIsReceivingResponse(false);
                            // 创建新的groupId而不是重置为空字符串
                            const newGroupId = uuidv4().replace(/-/g, '');
                            setGroupId(newGroupId);
                            if (senderRef.current) {
                                senderRef.current.focus();
                            }
                        }}
                >
                    新建对话
                </Button>
                <div className="w-full h-[calc(100vh-32px-16px-16px)] overflow-y-auto">
                    <Conversations
                        className="w-full"
                        items={historyItems}
                        activeKey={groupId}
                        defaultActiveKey={groupId || undefined}
                        onActiveChange={(key: string) => loadConversation(key)}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-4 flex-1 h-full box-border p-4 bg-gray-100">
                {/*标题*/}
                <div className="flex items-center w-full h-[60px]">
                    <p className="text-lg">{currentTitle}</p>
                </div>
                {/*对话气泡*/}
                <div className="flex-auto overflow-y-auto">
                    <Flex gap="middle" vertical>
                        {/* 渲染历史消息 */}
                        {chatHistory.map((msg, index) => (
                            msg.role === 'user' ? (
                                <Bubble
                                    key={`msg-${index}`}
                                    placement="end"
                                    content={msg.content}
                                    avatar={<img className="w-8 h-8 rounded-2xl" src={userStore.user.avatar} />}
                                    messageRender={renderMarkdown}
                                />
                            ) : (
                                <Bubble
                                    key={`msg-${index}`}
                                    placement="start"
                                    content={
                                        <AIResponse
                                            thinking={msg.thinking ? msg.thinking : ""}
                                            content={msg.content}
                                        />
                                    }
                                    avatar={<img className="w-8 h-8 rounded-2xl" src="/logo.svg"/>}
                                />
                            )
                        ))}
                    </Flex>
                </div>
                {/*输入框*/}
                <div>
                    <Sender
                        ref={senderRef}
                        className="bg-white"
                        value={inputValue}
                        onChange={setInputValue}
                        disabled={inputStatus || isReceivingResponse}
                        loading={inputLoading}
                        autoSize={{minRows: 3, maxRows: 15}}
                        placeholder="有任何问题都可以向小恐龙提问"
                        submitType="enter"
                        footer={({components}) => {
                            const {SendButton, LoadingButton, SpeechButton} = components;
                            return (
                                <Flex justify="space-between" align="center">
                                    <Flex gap="small" align="center">
                                        <Select
                                            value={modelType}
                                            onChange={setModelType}
                                            options={modelList.map(model => ({
                                                label: model.model_nickname,
                                                value: model.model_nickname
                                            })) || []}
                                        />
                                    </Flex>
                                    <Flex align="center">
                                        <SpeechButton/>
                                        <Divider type="vertical"/>
                                        {inputLoading || isReceivingResponse ? (
                                            <LoadingButton type="default"/>
                                        ) : (
                                            <SendButton
                                                type="primary"
                                                disabled={!inputValue.trim() || isReceivingResponse}
                                            />
                                        )}
                                    </Flex>
                                </Flex>
                            );
                        }}
                        onSubmit={(message) => {
                            if (!message.trim() || isReceivingResponse) return;

                            // 设置状态为发送中
                            setInputStatus(true);
                            setInputLoading(true);

                            // 清空输入框
                            setInputValue("");

                            // 发送消息
                            sendChatRequest(message);
                        }}
                        onCancel={() => {
                            setInputLoading(false);
                            setInputStatus(false);
                        }}
                        actions={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;
