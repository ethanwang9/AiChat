import {FC, useState, useRef, useEffect} from "react";
import {Card, Divider, Dropdown, Flex, MenuProps, message} from "antd";
import {Bubble, Sender} from "@ant-design/x";
import {DownOutlined} from "@ant-design/icons";
import {useMount, useRequest} from "ahooks";
import {GetModelList, PostPKChatHistory} from "@/apis/chat";
import {HttpModelList} from "@/types/http/chat";
import {streamRequest, SSEResponse} from "@/utils/sse.ts";
import {ChatRequestParams} from "@/types/http/chat.ts";
import AIResponse from "@/components/chat/AIResponse";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import {v4 as uuidv4} from 'uuid';

// 定义聊天消息类型
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    thinking?: string;
    isStreaming?: boolean;
}

const renderMarkdown = (content: string) => {
    return <MarkdownRenderer content={content}/>;
};

const PK: FC = () => {
    // 初始化
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
    const [modelList, setModelList] = useState<HttpModelList[]>([]);
    const [leftModel, setLeftModel] = useState<string>("");
    const [rightModel, setRightModel] = useState<string>("");
    
    // 聊天历史
    const [leftChatHistory, setLeftChatHistory] = useState<ChatMessage[]>([]);
    const [rightChatHistory, setRightChatHistory] = useState<ChatMessage[]>([]);
    
    // 流式响应状态
    const [leftIsStreaming, setLeftIsStreaming] = useState<boolean>(false);
    const [rightIsStreaming, setRightIsStreaming] = useState<boolean>(false);
    
    // 分组ID
    const [leftGroupId] = useState<string>(uuidv4().replace(/-/g, ''));
    const [rightGroupId] = useState<string>(uuidv4().replace(/-/g, ''));
    
    // 当前问题
    const [currentQuestion, setCurrentQuestion] = useState<string>("");
    
    // 模型ID映射
    const [modelIdMap, setModelIdMap] = useState<Record<string, number>>({});
    
    // 防止重复上传
    const [hasUploaded, setHasUploaded] = useState<boolean>(false);
    
    // Sender组件引用
    const senderRef = useRef<any>(null);

    // 上传PK对话记录
    const {run: uploadPKHistory} = useRequest((
        mid1: number,
        mid2: number,
        question: string,
        answer1: string,
        answer2: string
    ) => PostPKChatHistory(
        mid1,
        mid2,
        question,
        answer1,
        answer2
    ), {
        manual: true,
        onError: (error) => {
            message.error("PK记录保存失败, Error: " + error);
        }
    });

    // 检查并上传PK对话记录
    const checkAndUploadPKHistory = () => {
        // 如果已经上传过或者还在流式响应中，则不上传
        if (hasUploaded || leftIsStreaming || rightIsStreaming) {
            return;
        }
        
        // 确保有问题和回答
        if (currentQuestion && leftChatHistory.length > 0 && rightChatHistory.length > 0) {
            // 获取最后一条AI回复
            const leftAIMessages = leftChatHistory.filter(msg => msg.role === 'assistant' && !msg.isStreaming);
            const rightAIMessages = rightChatHistory.filter(msg => msg.role === 'assistant' && !msg.isStreaming);
            
            const leftAIMessage = leftAIMessages.length > 0 ? leftAIMessages[leftAIMessages.length - 1] : null;
            const rightAIMessage = rightAIMessages.length > 0 ? rightAIMessages[rightAIMessages.length - 1] : null;

            // 如果两侧都有AI回复，则上传PK对话记录
            if (leftAIMessage && rightAIMessage) {
                const leftModelId = modelIdMap[leftModel];
                const rightModelId = modelIdMap[rightModel];
                
                if (!leftModelId || !rightModelId) {
                    message.error("模型ID未找到，无法上传对话记录");
                    return;
                }
                
                uploadPKHistory(
                    leftModelId,
                    rightModelId,
                    currentQuestion,
                    leftAIMessage.content,
                    rightAIMessage.content
                );
                
                // 标记为已上传，防止重复上传
                setHasUploaded(true);
            }
        }
    };

    // 当两个模型都完成响应时，尝试上传对话记录
    useEffect(() => {
        if (!leftIsStreaming && !rightIsStreaming && currentQuestion && !hasUploaded) {
            checkAndUploadPKHistory();
        }
    }, [leftIsStreaming, rightIsStreaming, currentQuestion, hasUploaded]);

    // 获取模型列表
    const {run: fetchModelList} = useRequest(GetModelList, {
        manual: true,
        debounceWait: 800,
        onSuccess: (data: any) => {
            if (data && data.length >= 2) {
                setModelList(data);
                setLeftModel(data[0].model_nickname);
                setRightModel(data[1].model_nickname);
                
                // 构建模型名称到ID的映射
                const modelMap: Record<string, number> = {};
                data.forEach((model: HttpModelList) => {
                    modelMap[model.model_nickname] = model.id;
                });
                setModelIdMap(modelMap);
            } else {
                message.error("获取模型列表失败，模型数量不足");
            }
        },
        onError: () => {
            message.error("获取模型列表失败");
        }
    });

    // 组件挂载时执行
    useMount(() => {
        // 获取模型列表
        fetchModelList();
    });

    // 处理左侧模型选择
    const handleLeftModelSelect = (modelName: string) => {
        if (modelName === rightModel) {
            message.warning("两侧不能选择相同的模型");
            return;
        }
        setLeftModel(modelName);
    };

    // 处理右侧模型选择
    const handleRightModelSelect = (modelName: string) => {
        if (modelName === leftModel) {
            message.warning("两侧不能选择相同的模型");
            return;
        }
        setRightModel(modelName);
    };

    // 左侧模型下拉菜单
    const leftItems: MenuProps['items'] = modelList.map(model => ({
        key: model.model_nickname,
        label: <p>{model.model_nickname}</p>,
        disabled: model.model_nickname === rightModel,
        onClick: () => handleLeftModelSelect(model.model_nickname)
    }));

    // 右侧模型下拉菜单
    const rightItems: MenuProps['items'] = modelList.map(model => ({
        key: model.model_nickname,
        label: <p>{model.model_nickname}</p>,
        disabled: model.model_nickname === leftModel,
        onClick: () => handleRightModelSelect(model.model_nickname)
    }));
    
    // 发送左侧聊天请求
    const sendLeftChatRequest = (userMessage: string) => {
        // 添加用户消息到历史记录
        const newUserMessage: ChatMessage = {
            role: 'user',
            content: userMessage
        };

        // 先添加用户消息
        setLeftChatHistory(prev => [...prev, newUserMessage]);

        // 添加一个空的AI消息占位，用于流式更新
        const placeholderAIMessage: ChatMessage = {
            role: 'assistant',
            content: '',
            thinking: '',
            isStreaming: true
        };

        // 更新聊天历史，包含用户消息和占位AI消息
        setLeftChatHistory(prev => [...prev, placeholderAIMessage]);

        setLeftIsStreaming(true);

        // 构造请求参数
        const chatParams: ChatRequestParams = {
            channel: 1,
            model: leftModel.trim(),
            question: userMessage.trim(),
            gid: leftGroupId,
        };

        // 发送请求
        streamRequest.create<ChatRequestParams>(
            chatParams,
            {
                onSuccess: () => {
                    // 请求成功完成，更新AI消息的状态
                    setLeftChatHistory(prev => {
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

                    setLeftIsStreaming(false);
                },
                onError: () => {
                    // 移除占位AI消息
                    setLeftChatHistory(prev => prev.filter(msg => !msg.isStreaming));

                    setLeftIsStreaming(false);
                    message.error("左侧请求失败，请稍后重试");
                },
                onUpdate: (msg: SSEResponse) => {
                    // 处理返回的消息
                    if (msg.code !== undefined && (msg.code === 301 || msg.code === 300)) {
                        // 处理错误
                        message.error({
                            content: msg.message
                        });

                        // 移除占位AI消息
                        setLeftChatHistory(prev => prev.filter(msg => !msg.isStreaming));

                        setLeftIsStreaming(false);
                    } else if (msg.data) {
                        try {
                            // 处理返回消息
                            const {content, think} = JSON.parse(msg.data);

                            // 更新流式内容，用于显示
                            if (think !== undefined) {
                                // 同时更新历史记录中最后一条AI消息的思考内容
                                setLeftChatHistory(prev => {
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
                                // 同时更新历史记录中最后一条AI消息的内容
                                setLeftChatHistory(prev => {
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
    
    // 发送右侧聊天请求
    const sendRightChatRequest = (userMessage: string) => {
        // 添加用户消息到历史记录
        const newUserMessage: ChatMessage = {
            role: 'user',
            content: userMessage
        };

        // 先添加用户消息
        setRightChatHistory(prev => [...prev, newUserMessage]);

        // 添加一个空的AI消息占位，用于流式更新
        const placeholderAIMessage: ChatMessage = {
            role: 'assistant',
            content: '',
            thinking: '',
            isStreaming: true
        };

        // 更新聊天历史，包含用户消息和占位AI消息
        setRightChatHistory(prev => [...prev, placeholderAIMessage]);

        setRightIsStreaming(true);

        // 构造请求参数
        const chatParams: ChatRequestParams = {
            channel: 1,
            model: rightModel.trim(),
            question: userMessage.trim(),
            gid: rightGroupId,
        };

        // 发送请求
        streamRequest.create<ChatRequestParams>(
            chatParams,
            {
                onSuccess: () => {
                    // 请求成功完成，更新AI消息的状态
                    setRightChatHistory(prev => {
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

                    setRightIsStreaming(false);
                },
                onError: () => {
                    // 移除占位AI消息
                    setRightChatHistory(prev => prev.filter(msg => !msg.isStreaming));

                    setRightIsStreaming(false);
                    message.error("右侧请求失败，请稍后重试");
                },
                onUpdate: (msg: SSEResponse) => {
                    // 处理返回的消息
                    if (msg.code !== undefined && (msg.code === 301 || msg.code === 300)) {
                        // 处理错误
                        message.error({
                            content: msg.message
                        });

                        // 移除占位AI消息
                        setRightChatHistory(prev => prev.filter(msg => !msg.isStreaming));

                        setRightIsStreaming(false);
                    } else if (msg.data) {
                        try {
                            // 处理返回消息
                            const {content, think} = JSON.parse(msg.data);

                            // 更新流式内容，用于显示
                            if (think !== undefined) {
                                // 同时更新历史记录中最后一条AI消息的思考内容
                                setRightChatHistory(prev => {
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
                                // 同时更新历史记录中最后一条AI消息的内容
                                setRightChatHistory(prev => {
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

    return (
        <div className="flex flex-col h-screen w-full gap-4 box-border p-4">
            <div className="flex flex-auto gap-4 w-full">
                <Card className="flex-1/2 bg-red-400">
                    <Dropdown menu={{items: leftItems}} trigger={['click']}>
                        <a
                            className="font-bold flex gap-4 pb-2"
                            onClick={(e) => e.preventDefault()}
                        >
                            <p>{leftModel || "加载中..."}</p>
                            <DownOutlined/>
                        </a>
                    </Dropdown>
                    <div className="w-full h-[calc(100vh-22px-16px-16px-24px-24px-138px-16px-8px)] overflow-y-auto">
                        <Flex gap="middle" vertical>
                            {/* 渲染左侧历史消息 */}
                            {leftChatHistory.map((msg, index) => (
                                msg.role === 'user' ? (
                                    <Bubble
                                        key={`left-msg-${index}`}
                                        placement="end"
                                        content={msg.content}
                                        avatar={<img className="w-8 h-8" src="/src/assets/avatar/1.jpg" alt="头像"/>}
                                        messageRender={renderMarkdown}
                                    />
                                ) : (
                                    <Bubble
                                        key={`left-msg-${index}`}
                                        placement="start"
                                        content={
                                            <AIResponse
                                                thinking={msg.thinking ? msg.thinking : ""}
                                                content={msg.content}
                                            />
                                        }
                                        avatar={<img className="w-8 h-8" src="/logo.svg" alt="头像"/>}
                                    />
                                )
                            ))}
                        </Flex>
                    </div>
                </Card>
                <Card className="flex-1/2 bg-red-400">
                    <Dropdown menu={{items: rightItems}} trigger={['click']}>
                        <a
                            className="font-bold flex gap-4 pb-2"
                            onClick={(e) => e.preventDefault()}
                        >
                            <p>{rightModel || "加载中..."}</p>
                            <DownOutlined/>
                        </a>
                    </Dropdown>
                    <div className="w-full h-[calc(100vh-22px-16px-16px-24px-24px-138px-16px-8px)] overflow-y-auto">
                        <Flex gap="middle" vertical>
                            {/* 渲染右侧历史消息 */}
                            {rightChatHistory.map((msg, index) => (
                                msg.role === 'user' ? (
                                    <Bubble
                                        key={`right-msg-${index}`}
                                        placement="end"
                                        content={msg.content}
                                        avatar={<img className="w-8 h-8" src="/src/assets/avatar/1.jpg" alt="头像"/>}
                                        messageRender={renderMarkdown}
                                    />
                                ) : (
                                    <Bubble
                                        key={`right-msg-${index}`}
                                        placement="start"
                                        content={
                                            <AIResponse
                                                thinking={msg.thinking ? msg.thinking : ""}
                                                content={msg.content}
                                            />
                                        }
                                        avatar={<img className="w-8 h-8" src="/logo.svg" alt="头像"/>}
                                    />
                                )
                            ))}
                        </Flex>
                    </div>
                </Card>
            </div>
            {/*输入框*/}
            <div>
                <Sender
                    ref={senderRef}
                    className="bg-white"
                    value={value}
                    onChange={setValue}
                    disabled={loading || leftIsStreaming || rightIsStreaming}
                    loading={loading}
                    autoSize={{minRows: 3, maxRows: 15}}
                    placeholder="有任何问题都可以向小恐龙提问"
                    footer={({components}) => {
                        const {SendButton, LoadingButton, SpeechButton} = components;
                        return (
                            <Flex justify="flex-end" align="center">
                                <SpeechButton/>
                                <Divider type="vertical"/>
                                {loading || leftIsStreaming || rightIsStreaming ? (
                                    <LoadingButton type="default"/>
                                ) : (
                                    <SendButton type="primary" disabled={!value.trim()}/>
                                )}
                            </Flex>
                        );
                    }}
                    onSubmit={(message) => {
                        if (!message.trim() || loading || leftIsStreaming || rightIsStreaming) return;
                        
                        // 设置状态为发送中
                        setLoading(true);
                        
                        // 重置上传状态
                        setHasUploaded(false);
                        
                        // 保存当前问题
                        setCurrentQuestion(message);
                        
                        // 清空输入框
                        setValue("");
                        
                        // 同时发送两个请求
                        sendLeftChatRequest(message);
                        sendRightChatRequest(message);
                        
                        // 当两侧都完成时，解除loading状态
                        const checkLoadingStatus = () => {
                            if (!leftIsStreaming && !rightIsStreaming) {
                                setLoading(false);
                                clearInterval(interval);
                            }
                        };
                        
                        const interval = setInterval(checkLoadingStatus, 500);
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
