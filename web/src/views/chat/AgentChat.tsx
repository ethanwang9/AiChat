import {FC, useState, useRef} from "react";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {Button, Divider, Flex, Select, message} from "antd";
import {Bubble, Sender} from "@ant-design/x";
import {useLocation, useNavigate} from "react-router";
import {useMount, useRequest} from "ahooks";
import {GetChatAgentID, GetModelList} from "@/apis/chat";
import {ChatRequestParams, HTTPChatAgentList, HttpModelList} from "@/types/http/chat";
import {streamRequest, SSEResponse} from "@/utils/sse.ts";
import {useUserStore} from "@/hooks/userHooks.ts";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import AIResponse from "@/components/chat/AIResponse";
import {v4 as uuidv4} from 'uuid';

// 定义聊天消息类型
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    thinking?: string;
    isStreaming?: boolean;
}

const AgentChat: FC = () => {
    // 初始化
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
    const [agentDetail, setAgentDetail] = useState<HTTPChatAgentList | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [modelType, setModelType] = useState<string>("");
    const [modelList, setModelList] = useState<HttpModelList[]>([]);
    const [isReceivingResponse, setIsReceivingResponse] = useState<boolean>(false);
    const [gid, setGid] = useState<string>("");
    
    const navigate = useNavigate();
    const location = useLocation();
    const senderRef = useRef<any>(null);
    const userStore = useUserStore();

    // 从URL获取智能体ID
    const getAgentIdFromUrl = () => {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('id');
        return id ? parseInt(id) : null;
    };

    // 获取智能体详情
    const {loading: agentLoading} = useRequest(
        () => {
            const agentId = getAgentIdFromUrl();
            if (agentId) {
                return GetChatAgentID(agentId);
            }
            return Promise.reject("未找到智能体ID");
        },
        {
            manual: false,
            onSuccess: (response) => {
                if (response) {
                    // 修复类型问题
                    setAgentDetail(response as unknown as HTTPChatAgentList);
                }
            },
            onError: () => {
                message.error("获取智能体详情失败");
                navigate('/service/agent');
            }
        }
    );

    // 获取模型列表
    const {run: fetchModelList} = useRequest(GetModelList, {
        manual: true,
        debounceWait: 800,
        onSuccess: (data: any) => {
            setModelList(data);
            setModelType(data[0].model_nickname);
        },
    });

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

        setIsReceivingResponse(true);

        // 构造请求参数
        const chatParams: ChatRequestParams = {
            channel: 1,
            model: modelType,
            question: userMessage,
            aid: agentDetail?.id,
            gid: gid,
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
                        return updated;
                    });

                    setLoading(false);
                    setIsReceivingResponse(false);
                },
                onError: () => {
                    // 移除占位AI消息
                    setChatHistory(prev => prev.filter(msg => !msg.isStreaming));

                    setLoading(false);
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

                        setLoading(false);
                        setIsReceivingResponse(false);
                    } else if (msg.data) {
                        try {
                            // 处理返回消息
                            const {content, think} = JSON.parse(msg.data);

                            // 更新历史记录中最后一条AI消息
                            setChatHistory(prev => {
                                const updated = [...prev];
                                if (updated.length > 0) {
                                    const lastMsg = updated[updated.length - 1];
                                    if (lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                                        if (think !== undefined) {
                                            lastMsg.thinking = (lastMsg.thinking || '') + think;
                                        } else if (content !== undefined) {
                                            lastMsg.content = (lastMsg.content || '') + content;
                                        }
                                    }
                                }
                                return updated;
                            });
                        } catch (e) {
                            console.error('Error parsing message data:', e);
                        }
                    }
                },
            },
        );
    };

    // 生命周期 - 挂载
    useMount(() => {
        // 设置gid
        setGid(uuidv4().replace(/-/g, ''));
        // 获取模型列表
        fetchModelList();
    });

    // 返回智能体页面
    const goPageAgent = () => {
        navigate('/service/agent');
    }

    // 渲染markdown内容
    const renderMarkdown = (content: string) => {
        return <MarkdownRenderer content={content}/>;
    };

    return (
        <div className="flex h-screen w-full gap-4 overflow-hidden p-4">
            <div className="box-border flex h-full flex-6/24 flex-col items-center justify-center gap-4 bg-white p-8">
                <img
                    className="h-16 w-16 overflow-hidden rounded-full"
                    src={agentDetail?.avatar || "/logo.svg"}
                    alt={agentDetail?.name || "Agent"}
                />
                <p className="font-bold text-xl line-clamp-1">{agentDetail?.name || "加载中..."}</p>
                <p className="text-sm leading-6 text-gray-800 mt-10 bg-blue-100 p-4 rounded-lg line-clamp-5">
                    {agentDetail?.description || "加载中..."}
                </p>
            </div>
            <div className="flex flex-col h-full flex-18/24 bg-white box-border p-4 gap-4">
                <div className="flex items-center gap-4">
                    <Button shape="circle" icon={<ArrowLeftOutlined/>} onClick={goPageAgent}></Button>
                    <p>{agentDetail?.name || "加载中..."}</p>
                </div>
                <div className="flex-auto overflow-y-auto">
                    <Flex gap="middle" vertical>
                        {chatHistory.map((msg, index) => (
                            msg.role === 'user' ? (
                                <Bubble
                                    key={`msg-${index}`}
                                    placement="end"
                                    content={msg.content}
                                    avatar={<img className="w-8 h-8 rounded-2xl" src={userStore.user.avatar || "/src/assets/avatar/1.jpg"} />}
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
                                    avatar={<img className="w-8 h-8 rounded-2xl" src={agentDetail?.avatar || "/logo.svg"}/>}
                                />
                            )
                        ))}
                    </Flex>
                </div>
                <div>
                    <Sender
                        ref={senderRef}
                        className="bg-white"
                        value={value}
                        onChange={setValue}
                        disabled={loading || isReceivingResponse}
                        loading={loading}
                        autoSize={{minRows: 3, maxRows: 15}}
                        placeholder={`有任何问题都可以向${agentDetail?.name || '智能体'}提问`}
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
                                        {loading || isReceivingResponse ? (
                                            <LoadingButton type="default"/>
                                        ) : (
                                            <SendButton
                                                type="primary"
                                                disabled={!value.trim() || isReceivingResponse}
                                            />
                                        )}
                                    </Flex>
                                </Flex>
                            );
                        }}
                        onSubmit={(message) => {
                            if (!message.trim() || isReceivingResponse) return;

                            // 设置状态为发送中
                            setLoading(true);

                            // 清空输入框
                            setValue("");

                            // 发送消息
                            sendChatRequest(message);
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
