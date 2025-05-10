import {HttpAuthLogin} from '@/types/http/auth';
import { MsgBack } from '@/types/msgBack';
import request from '@/utils/request';

// 获取对话内容
export const PostChatChat = ():MsgBack<HttpAuthLogin> => request({
    url: "/chat/chat",
    method: "post",
})