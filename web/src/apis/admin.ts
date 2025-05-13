import {
    HTTPAdminHistoryGroupInfo,
    HTTPAdminHistoryPage,
    HTTPAdminManagerAgentGet,
    HTTPAdminManagerLogGet, HTTPAdminManagerModelChannelGet, HTTPAdminManagerModelListGet,
    HTTPAdminUserinfo,
    HTTPAdminChatHistoryGet,
    HTTPAdminSystemConfigGet,
    HTTPAdminSystemAuthGet
} from '@/types/http/admin';
import { MsgBack } from '@/types/msgBack';
import request from '@/utils/request';

// ===
// 用户
// ===

// 获取用户信息
export const GetAdminUserinfo = (): MsgBack<HTTPAdminUserinfo> => request({
    url: "/admin/userinfo",
    method: "get",
})

// 上传用户头像
export const UploadAdminUserAvatar = (avatar: File): MsgBack<null> => {
    const formData = new FormData();
    formData.append("avatar", avatar);

    return request({
        url: "/admin/userinfo",
        method: "put",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        data: formData,
    })
}

// 注销账号
export const DeleteAdminUser = (): MsgBack<null> => request({
    url: "/admin/userinfo",
    method: "delete",
})

// ===
// 历史记录
// ===

// 获取历史记录分页数据
export const GetAdminHistoryPage = (limit: number, offset: number): MsgBack<HTTPAdminHistoryPage> => request({
    url: "/admin/history",
    method: "get",
    params: {
        limit,
        offset,
    }
})

// 获取用户指定历史记录
export const GetAdminHistoryGroupID = (gid: string): MsgBack<Array<HTTPAdminHistoryGroupInfo>> => request({
    url: `/admin/history/${gid}`,
    method: "get",
})

// 删除用户全部历史记录
export const DeleteAdminHistory = (): MsgBack<null> => request({
    url: "/admin/history",
    method: "delete",
})

// 删除用户指定历史记录
export const DeleteAdminHistoryID = (gid: string): MsgBack<null> => request({
    url: `/admin/history/${gid}`,
    method: "delete",
})

// ===
// 【管理】日志
// ===
// 获取系统日志
export const GetAdminLog = (limit: number, offset: number): MsgBack<HTTPAdminManagerLogGet> => request({
    url: "/admin/log",
    method: "get",
    params: {
        limit,
        offset,
    }
})

// 删除系统日志
export const DeleteAdminLog = (id: string): MsgBack<null> => request({
    url: `/admin/log/${id}`,
    method: "delete",
})

// ===
// 【管理】模型
// ===
// 获取通道信息
export const GetAdminModelChannel = (limit: number, offset: number): MsgBack<HTTPAdminManagerModelChannelGet> => request({
    url: "/admin/model/channel",
    method: "get",
    params: {
        limit,
        offset,
    }
})
// 获取模型列表
export const GetAdminModelList = (limit: number, offset: number): MsgBack<HTTPAdminManagerModelListGet> => request({
    url: "/admin/model/list",
    method: "get",
    params: {
        limit,
        offset,
    }
})
// 更新模型通道信息
export const UpdateAdminModelChannel = (id: number, name: string, url: string, key: string): MsgBack<null> => request({
    url: "/admin/model/channel",
    method: "put",
    data: {
        id,
        name,
        url,
        key
    }
})

// 更新模型列表信息
export const UpdateAdminModelList = (id: number, cid: number, name: string, nickname: string, status: string): MsgBack<null> => request({
    url: "/admin/model/list",
    method: "put",
    data: {
        id,
        cid,
        name,
        nickname,
        status,
    }
})

// 删除通道
export const DeleteAdminModelChannel = (id: number): MsgBack<null> => request({
    url: "/admin/model/channel",
    method: "delete",
    data: {
        id,
    }
})

// 删除模型
export const DeleteAdminModelList = (id: number): MsgBack<null> => request({
    url: "/admin/model/list",
    method: "delete",
    data: {
        id,
    }
})

// 添加模型通道
export const CreateAdminModelChannel = (name: string, key: string, url: string): MsgBack<null> => request({
    url: "/admin/model/channel",
    method: "post",
    data: {
        name,
        key,
        url,
    }
})


// 添加模型列表
export const CreateAdminModelList = (cid: number, name: string, nickname: string, status: string): MsgBack<null> => request({
    url: "/admin/model/list",
    method: "post",
    data: {
        cid,
        name,
        nickname,
        status,
    }
})

// ===
// 【管理】模型
// ===

// 获取智能体
export const GetAdminAgent = (limit: number, offset: number): MsgBack<HTTPAdminManagerAgentGet> => request({
    url: "/admin/agent",
    method: "get",
    params: {
        limit,
        offset,
    }
})

// 删除智能体
export const DeleteAdminAgent = (id: number): MsgBack<null> => request({
    url: "/admin/agent",
    method: "delete",
    data: {
        id,
    }
})

// 添加智能体
export const CreateAdminAgent = (name: string, description: string, prompt: string, temperature: number, avatar: File | null, category: string): MsgBack<null> => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("prompt", prompt);
    formData.append("temperature", temperature.toString());
    formData.append("category", category);
    if (avatar) {
        formData.append("avatar", avatar);
    }

    return request({
        url: "/admin/agent",
        method: "post",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        data: formData,
    });
}

// 更新智能体
export const UpdateAdminAgent = (id: number, name: string, description: string, prompt: string, temperature: number, avatar: File | null, category: string): MsgBack<null> => {
    const formData = new FormData();
    formData.append("id", id.toString());
    formData.append("name", name);
    formData.append("description", description);
    formData.append("prompt", prompt);
    formData.append("temperature", temperature.toString());
    formData.append("category", category);
    if (avatar !== null) {
        formData.append("avatar", avatar);
    } else {
        formData.append("avatar", new File([], "empty.png"));
    }

    return request({
        url: "/admin/agent",
        method: "put",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        data: formData,
    });
}

// ===
// 【管理】对话管理
// ===

// 获取聊天历史记录
export const GetAdminChatHistory = (limit: number, offset: number): MsgBack<HTTPAdminChatHistoryGet> => request({
    url: "/admin/chat/history",
    method: "get",
    params: {
        limit,
        offset,
    }
})

// ===
// 【管理】系统
// ===
// 获取系统配置信息
export const GetAdminSystemConfig = (): MsgBack<HTTPAdminSystemConfigGet> => request({
    url: "/admin/system/config",
    method: "get",
})
// 保存系统配置信息
export const UpdateAdminSystemConfig = (name: string, gov: string, icp: string, logo: File | null): MsgBack<null> => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("gov", gov);
    formData.append("icp", icp);
    if (logo != null) {
        formData.append("logo", logo);
    } else {
        formData.append("logo", new File([], "empty.png"));
    }
    
    return request({
        url: "/admin/system/config",
        method: "put",
        data: formData,
    })
}
// 获取系统登录配置信息
export const GetAdminSystemAuth = (): MsgBack<HTTPAdminSystemAuthGet> => request({
    url: "/admin/system/auth",
    method: "get",
})
// 保存系统登录配置信息
export const UpdateAdminSystemAuth = (appid: string, key: string): MsgBack<null> => request({
    url: "/admin/system/auth",
    method: "put",
    data: {
        appid,
        key,
    }
})
