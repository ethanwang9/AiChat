// 定义聊天请求参数类型
export interface ChatRequestParams {
    channel: number;
    model: string;
    history: Array<{
        role: string;
        content: string;
    }>;
}