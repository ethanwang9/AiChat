import { HTTPAdminHistoryPage, HTTPAdminUserinfo } from '@/types/http/admin';
import { MsgBack } from '@/types/msgBack';
import request from '@/utils/request';

// 获取用户信息
export const GetAdminUserinfo = (): MsgBack<HTTPAdminUserinfo> => request({
    url: "/admin/userinfo",
    method: "get",
})

// 获取历史记录分页数据
export const GetAdminHistoryPage = (limit: number, offset: number): MsgBack<HTTPAdminHistoryPage> => request({
    url: "/admin/history",
    method: "get",
    params: {
        limit,
        offset,
    }
})