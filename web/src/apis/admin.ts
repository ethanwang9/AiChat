import {
    HTTPAdminHistoryGroupInfo,
    HTTPAdminHistoryPage,
    HTTPAdminManagerLogGet, HTTPAdminManagerModelChannelGet, HTTPAdminManagerModelListGet,
    HTTPAdminUserinfo
} from '@/types/http/admin';
import { MsgBack } from '@/types/msgBack';
import request from '@/utils/request';
import { url } from 'inspector';

// ===
// 用户
// ===

// 获取用户信息
export const GetAdminUserinfo = (): MsgBack<HTTPAdminUserinfo> => request({
    url: "/admin/userinfo",
    method: "get",
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