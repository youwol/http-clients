export interface Groups {
    id: string
    path: string
}

export interface UserInfos {
    name: string
    temp: boolean
    groups: Groups[]
}

export interface SessionBaseDetails {
    userInfo: UserInfos
    remembered: boolean
    impersonating: false
}

export interface SessionImpersonationDetails {
    userInfo: UserInfos
    remembered: boolean
    realUserInfo: UserInfos
    impersonating: true
}

export type SessionDetails = SessionImpersonationDetails | SessionBaseDetails

export type Empty = Record<string, never>
