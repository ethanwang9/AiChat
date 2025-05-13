export interface HTTPAdminUserinfo {
    avatar: string;
    mail: string;
    name: string;
    phone: string;
    uid: number;
}

export interface HTTPAdminHistoryPage {
    history: {
        id: string;
        uid: number;
        group_id: string;
        title: string;
        question: string;
        answer: string;
        created_at: string;
        updated_at: string;
        deleted_at: string;
    };
    total: number;
}

export interface HTTPAdminHistoryGroupInfo {
    id: string;
    uid: number;
    group_id: string;
    title: string;
    question: string;
    answer: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface HTTPAdminManagerLogGet {
    log: Array<{
        id: string;
        operate: string;
        uid: number;
        job: string;
        content: string;
        created_at: string;
        updated_at: string;
        deleted_at: string;
    }>;
    total: number;
}

export interface HTTPAdminManagerModelChannelGet {
    channel: Array<{
        id: number
        name: string
        url: string
        key: string
        money: number
        created_at: string
    }>;
    total: number;
}

export interface HTTPAdminManagerModelListGet {
    list: Array<{
        id: number
        cid: number
        name: string
        nickname: string
        status: string
        created_at: string
        updated_at: string
    }>
    total: number
}

export interface HTTPAdminManagerAgentGet {
    agent: Array<{
        id: number,
        name: string,
        description: string,
        prompt: string,
        temperature: number,
        avatar: string,
        category: string,
        created_at: string,
    }>
    total: number
}

export interface HTTPAdminChatHistoryGet {
    history: Array<{
        id: string;
        uid: number;
        group_id: string;
        title: string;
        question: string;
        answer: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    }>;
    total: number;
}

export interface HTTPAdminSystemConfigGet {
    logo: string;
    name: string;
    gov: string;
    icp: string;
}

export interface HTTPAdminSystemAuthGet {
    appid: string;
    key: string;
}

