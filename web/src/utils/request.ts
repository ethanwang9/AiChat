import axios from "axios";
import { message as msg } from 'antd';
import HTTPBack from "@/types/msgBack.ts";
import { UserState } from "@/stores/userSlice";

const request = axios.create({
    baseURL: "/api/v1",
})

// 请求拦截 - 发送前
request.interceptors.request.use(function (config) {
    // 设置请求类型
    config.headers["content-type"] = "application/x-www-form-urlencoded";
    // 添加用户令牌
    const userinfo: UserState = JSON.parse(window.localStorage.getItem("user") || '{}')
    if (userinfo.token && userinfo.token.length > 0) {
        config.headers!["Authorization"] = "Bearer " + userinfo.token
    }

    return config;
}, function (error) {
    return Promise.reject(error);
})

// 请求拦截- 接收后
request.interceptors.response.use(function (response) {
    // 判断返回接口状态码
    const { code, message } = response.data as HTTPBack<any> || undefined

    // console.log(response);

    // 1. auth 返回错误
    if (code === 301) {
        // 清除用户令牌
        window.localStorage.removeItem("user")

        // 提示用户
        msg.error({
            content: '身份令牌校验失败',
        });

        // 当地址是/admin开头则跳转到/
        if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/";
        }

        return Promise.reject(message);
    }

    // 2. 错误类型
    if (code !== 0) {
        msg.error({
            content: message,
        });
        return Promise.reject(message);
    }

    return Promise.resolve(response.data!.data);
}, function (error) {
    msg.error({
        content: "请求失败, " + error.message,
    });
    return Promise.reject(error);
})

export default request