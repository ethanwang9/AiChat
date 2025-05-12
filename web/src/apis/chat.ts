import { HTTPChatAgentList, HTTPChatHistory, HTTPChatHistoryList, HttpModelList } from '@/types/http/chat';
import { MsgBack } from '@/types/msgBack';
import request from '@/utils/request';

// 获取模型列表
export const GetModelList = (): MsgBack<Array<HttpModelList>> => request({
    url: "/chat/model",
    method: "get",
})

// 上报历史对话记录
export const PostChatHistory = (group_id: string, title: string, question: string, answer: string): MsgBack<null> => request({
    url: "/chat/history",
    method: "post",
    data: {
        answer,
        group_id,
        question,
        title,
    }
})

// 上报擂台对话记录
export const PostPKChatHistory = (mid1: number, mid2: number, question: string, answer1: string, answer2: string): MsgBack<null> => request({
    url: "/chat/pk/history",
    method: "post",
    data: {
        mid1,
        mid2,
        question,
        answer1,
        answer2,
    }
})

// 获取前35条历史记录
export const GetChatHistory = (): MsgBack<Array<HTTPChatHistory>> => request({
    url: "/chat/history",
    method: "get",
})

// 获取指定历史记录
export const GetChatHistoryList = (groupID: string): MsgBack<Array<HTTPChatHistoryList>> => request({
    url: "/chat/history/" + groupID,
    method: "get",
})

// 获取智能体分类
export const GetChatAgentCategory = (): MsgBack<Array<string>> => request({
    url: "/chat/agent/category",
    method: "get",
})

// 获取智能体列表
export const GetChatAgentList = (category: string): MsgBack<Array<HTTPChatAgentList>> => request({
    url: "/chat/agent/list",
    method: "get",
    params: {
        category,
    },
})

// 获取智能体详情
export const GetChatAgentID = (id: number): MsgBack<HTTPChatAgentList> => request({
    url: "/chat/agent/" + id,
    method: "get",
})