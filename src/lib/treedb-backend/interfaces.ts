export interface GetHealthzResponse {
    status: 'treedb-backend ok'
}

export interface PutDriveBody {
    name: string
    driveId?: string
    metadata?: string
}
export interface BaseDrive {
    driveId: string
    groupId: string
    name: string
    metadata: string
}

export interface PutDriveResponse extends BaseDrive {}

export interface GetDriveResponse extends BaseDrive {}

export interface GetDrivesResponse {
    drives: GetDriveResponse[]
}

export interface PostDriveBody {
    name: string
}

export interface PostDriveResponse extends BaseDrive {}

export interface FolderBase {
    folderId: string
    parentFolderId: string
    driveId: string
    groupId: string
    name: string
    type: string
    metadata: string
}

export interface GetFolderResponse extends FolderBase {}

export interface PutFolderBody {
    name: string
    type?: string
    metadata?: string
    folderId?: string
}

export interface PostFolderBody {
    name: string
}

export interface PostFolderResponse extends FolderBase {}
export interface PutFolderResponse extends FolderBase {}

export interface ItemBase {
    itemId: string
    relatedId: string
    folderId: string
    driveId: string
    groupId: string
    name: string
    type: string
    metadata: string
}

export interface PutItemBody {
    name: string
    type?: string
    metadata?: string
    itemId?: string
    relatedId: string
}

export interface PutItemResponse extends ItemBase {}

export interface PostItemBody {
    name: string
}

export interface PostItemResponse extends ItemBase {}

export interface PostMoveBody {
    targetId: string
    destinationFolderId: string
}

export interface GetItemResponse extends ItemBase {}

export interface ItemsBase {
    items: ItemBase[]
}
export interface GetItemsByRelatedIdResponse extends ItemsBase {}

export interface PathBase {
    item?: ItemBase
    folders: FolderBase[]
    drive: BaseDrive
}

export interface GetPathResponse extends PathBase {}
export interface GetPathFolderResponse extends PathBase {}

export interface PostMoveResponse {
    foldersCount: number
    items: ItemBase[]
}

export interface GetEntityResponse {
    entityType: string
    entity: GetItemResponse | GetFolderResponse | GetDriveResponse
}

export interface GetChildrenResponse {
    items: GetItemResponse[]
    folders: GetFolderResponse[]
}

export interface GetDeletedResponse {
    items: GetItemResponse[]
    folders: GetFolderResponse[]
}

export interface DeleteItemResponse {}
export interface DeleteFolderResponse {}
export interface DeleteDriveResponse {}

export interface PurgeDriveResponse {
    foldersCount: number
    itemsCount: number
    items: ItemBase[]
}
