import { HTTPAdminUserinfo } from '@/types/http/admin';
import { MsgBack } from '@/types/msgBack';
import request from '@/utils/request';

// 获取用户信息
export const GetAdminUserinfo = ():MsgBack<HTTPAdminUserinfo> => request({
    url: "/admin/userinfo",
    method: "get",
})