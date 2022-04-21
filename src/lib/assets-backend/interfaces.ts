export interface GetHealthzResponse {
    status: 'assets-backend ok'
}

export type ReadPolicy =
    | 'forbidden'
    | 'authorized'
    | 'owning'
    | 'expiration-date'
export type SharePolicy = 'forbidden' | 'authorized'

export interface AccessPolicy {
    read: ReadPolicy
    share: SharePolicy
    parameters: { [k: string]: unknown }
}

export interface AddImageBody {
    content: File | Blob
}

export interface CreateAssetBody {
    assetId?: string
    relatedId: string
    kind: string
    groupId?: string
    name: string
    description: string
    tags?: string[]
    defaultAccessPolicy?: AccessPolicy
}

export interface AssetBase {
    assetId: string
    relatedId: string
    kind: string
    groupId: string
    name: string
    description: string
    tags: string[]
    defaultAccessPolicy?: AccessPolicy
}

export interface CreateAssetResponse extends AssetBase {}

export interface UpdateAssetBody {
    name?: string
    description?: string
    tags?: string[]
    groupId?: string
    defaultAccessPolicy?: AccessPolicy
}

export interface UpdateAssetResponse extends AssetBase {}
export interface GetAssetResponse extends AssetBase {}

export interface UpsertAccessPolicyBody extends AccessPolicy {}
export interface UpsertAccessPolicyResponse {}
export interface DeleteAccessPolicyResponse {}

export interface GetAccessPolicyResponse extends AccessPolicy {
    timestamp: number
}

export interface GetPermissionsResponse {
    write: boolean
    read: boolean
    share: boolean
    expiration?: number
}

export interface DeleteAssetResponse {}
export interface AddImageResponse {}
export interface RemoveImageResponse {}
