export type Json = Record<string, never>
export type RawId = string

export interface HealthzResponse {
    status: 'assets-gateway ok'
}

export interface UserInfoResponse {
    name: string
    groups: GroupResponse[]
}

export interface GroupResponse {
    id: string
    path: string
}

export interface GroupsResponse {
    groups: Array<GroupResponse>
}
