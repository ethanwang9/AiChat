import { ChatRequestParams } from "@/types/http/chat";
import { XRequest } from "@ant-design/x";
import { message } from "antd";

// 定义SSE响应类型
export interface SSEResponse {
  code?: number;
  message?: string;
  data?: string;
}

// 定义SSE回调函数类型
export interface SSECallbacks {
  onSuccess?: (msg: any) => void;
  onError?: (error: any) => void;
  onUpdate?: (content: string) => void;
}

// 创建SSE请求实例
export const streamRequest = XRequest({
  baseURL: "/api/v1/chat/chat",
  fetch: async (baseURL, data) => {
    const body = Object.entries(JSON.parse(data?.body as string) as Record<string, any>).map(([key, value]) => {
      if (key === "history") {
        return `${key}=${JSON.stringify(value)}`;
      } else {
        return `${key}=${value}`
      }
    }).join("&")
    const token = JSON.parse(localStorage.getItem("user") as string)?.token + "1" || "";
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

// 创建聊天请求函数
export const createChatRequest = (params: ChatRequestParams, callbacks: SSECallbacks) => {
  return streamRequest.create<ChatRequestParams>(
    params,
    {
      onSuccess: callbacks.onSuccess,
      onError: callbacks.onError,
      onUpdate: (msg: any) => {
        // 处理返回的消息
        if (msg.code !== undefined && msg.code === 301) {
          // 处理错误
          message.error({
            content: msg.message
          });
        } else if (msg.data) {
          // 处理返回消息
          const { content } = JSON.parse(msg.data);
          callbacks.onUpdate?.(content);
        }
      },
    },
  );
}; 