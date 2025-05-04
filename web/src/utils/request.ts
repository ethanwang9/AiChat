import axios from "axios";
import {useUserStore} from "@/hooks/userHooks.ts";
import {message} from 'antd';

const request = axios.create({
    baseURL: "/api/v1",
    timeout: 1000 * 60,
})

// 消息弹窗
const [messageApi] = message.useMessage();

// 请求拦截 - 发送前
request.interceptors.request.use(function (config) {
    // 用户store
    const userStore = useUserStore();

    // 添加认证
    config.headers!["Authorization"] = "Bearer " + userStore.user.token
    config.headers!["Content-Type"] = "application/x-www-form-urlencoded"

    return config;
}, function (error) {
    return Promise.reject(error);
})

// 请求拦截- 接收后
request.interceptors.response.use(function (response) {
    // 用户store
    const userStore = useUserStore();

    // 判断返回接口状态码
    const code: number = response.data.code || undefined

    // 1. auth 返回错误
    if (code === 301) {
        // 清空本地缓存
        userStore.logout()
        // 提示用户
        messageApi.open({
            type: 'error',
            content: '身份令牌校验失败',
            onClose: () => window.location.href = "/"
        });
    }

    // 2. 错误类型
    if (code !== 0) {
        messageApi.open({
            type: 'error',
            content: response.data.message,
            onClose: () => window.location.href = "/"
        });
    }

    return response.data.data;
}, function (error) {
    messageApi.open({
        type: 'error',
        content: "请求失败, " + error.message,
    });
    return Promise.reject(error);
})

export default request