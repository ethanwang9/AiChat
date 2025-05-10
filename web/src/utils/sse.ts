import { XRequest } from "@ant-design/x";

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