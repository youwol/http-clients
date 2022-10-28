import { GetAssetResponse } from '../assets-backend'
import { PurgeDriveResponse } from '../explorer-backend'

export type Json = Record<string, never>
export type RawId = string

export interface GetHealthzResponse {
    status: 'assets-gateway ok'
}

export interface UserInfoResponse {
    name: string
    groups: GroupResponse[]
}

export type GetUserInfoResponse = UserInfoResponse

export interface GroupResponse {
    id: string
    path: string
}

export interface GroupsResponse {
    groups: Array<GroupResponse>
}

export type QueryGroupsResponse = GroupsResponse

export interface NewAssetResponse<T> extends GetAssetResponse {
    readonly itemId: string
    readonly rawResponse: T
}

export interface AssetsGtwPurgeResponse extends PurgeDriveResponse {
    errorsRawDeletion: string[]
    errorsAssetDeletion: string[]
}
