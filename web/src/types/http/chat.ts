// 定义聊天请求参数类型
export interface ChatRequestParams {
    channel: number;
    model: string;
    history: Array<{
        role: string;
        content: string;
    }>;
}

export interface HttpModelList {
    id: number;
    channel_name: string;
    model_nickname: string;
    category: {
        list: string[]
    };
}

export interface HTTPChatHistory {
    group_id: string;
    title: string;
    create_at: string;
}

export interface HTTPChatHistoryList {
    role: string;
    content: string;
}