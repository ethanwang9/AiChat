import request from '@/utils/request';
import { MsgBack } from "@/types/msgBack.ts";
import { HttpHomeBase } from "@/types/http/home.ts";

// 获取网站基本信息
export const GetHomeBase = (): MsgBack<HttpHomeBase> => request({
    method: "get",
    url: "/home/base",
})
