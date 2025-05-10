import {HTTPChatHistory, HTTPChatHistoryList, HttpModelList} from '@/types/http/chat';
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

// 获取前35条历史记录
export const GetChatHistory = (): MsgBack<Array<HTTPChatHistory>> => request({
    url: "/chat/history",
    method: "get",
})

// 获取指定历史记录
export const GetChatHistoryList = (groupID: string): MsgBack<Array<HTTPChatHistoryList>> => request({
    url: "/chat/history/"+groupID,
    method: "get",
})