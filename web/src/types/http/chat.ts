// 定义聊天请求参数类型
export interface ChatRequestParams {
    channel: number;
    model: string;
    question:string;
    gid: string;
}

export interface HttpModelList {
    id: number;
    channel_name: string;
    model_nickname: string;
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