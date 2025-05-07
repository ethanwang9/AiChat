import {HttpAuthCheck, HttpAuthLogin} from '@/types/http/auth';
import { MsgBack } from '@/types/msgBack';
import request from '@/utils/request';

// 获取登录链接
export const GetAuthLogin = ():MsgBack<HttpAuthLogin> => request({
    url: "/auth/login",
    method: "get",
})

// 获取登录令牌
// @param state 登录状态
export const GetAuthCheck = (state: string):MsgBack<HttpAuthCheck> => request({
    url: "/auth/check",
    method: "get",
    params: {
        state: state,
    }
})