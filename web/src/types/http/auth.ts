export interface HttpAuthLogin {
    id: string
    link: string
}

export interface HttpAuthCheck {
    role: string
    status: boolean
    token: string
    avatar: string
}
