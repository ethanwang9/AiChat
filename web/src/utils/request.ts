import axios from "axios";
import {message as msg} from 'antd';
import HTTPBack from "@/types/msgBack.ts";

const request = axios.create({
    baseURL: "/api/v1",
    timeout: 1000 * 60,
})

// 请求拦截 - 发送前
request.interceptors.request.use(function (config) {
    // 用户store
    // const userStore = useUserStore();

    // 添加认证
    // config.headers!["Authorization"] = "Bearer " + userStore.user.token
    config.headers!["Content-Type"] = "application/x-www-form-urlencoded"

    return config;
}, function (error) {
    return Promise.reject(error);
})

// 请求拦截- 接收后
request.interceptors.response.use(function (response) {
    // 用户store
    // const userStore = useUserStore();

    // 判断返回接口状态码
    const {code, message} = response.data as HTTPBack<any> || undefined

    // 1. auth 返回错误
    if (code === 301) {
        // TODO 清除用户令牌

        // 提示用户
        msg.error({
            content: '身份令牌校验失败',
            onClose: () => window.location.href = "/"
        });
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