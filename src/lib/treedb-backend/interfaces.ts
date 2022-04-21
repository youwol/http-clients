export interface GetHealthzResponse {
    status: 'treedb-backend ok'
}

export interface CreateDriveBody {
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

export interface CreateDriveResponse extends BaseDrive {}

export interface GetDriveResponse extends BaseDrive {}

export interface QueryDrivesResponse {
    drives: GetDriveResponse[]
}

export interface UpdateDriveBody {
    name: string
}

export interface UpdateDriveResponse extends BaseDrive {}

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

export interface CreateFolderBody {
    name: string
    type?: string
    metadata?: string
    folderId?: string
}

export interface UpdateFolderBody {
    name: string
}

export interface UpdateFolderResponse extends FolderBase {}
export interface CreateFolderResponse extends FolderBase {}

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

export interface CreateItemBody {
    name: string
    type?: string
    metadata?: string
    itemId?: string
    relatedId: string
}

export interface CreatetemResponse extends ItemBase {}

export interface UpdateItemBody {
    name: string
}

export interface UpdateItemResponse extends ItemBase {}

export interface PostMoveBody {
    targetId: string
    destinationFolderId: string
}

export interface GetItemResponse extends ItemBase {}

export interface ItemsBase {
    items: ItemBase[]
}
export interface QueryItemsByRelatedIdResponse extends ItemsBase {}

export interface PathBase {
    item?: ItemBase
    folders: FolderBase[]
    drive: BaseDrive
}

export interface GetPathResponse extends PathBase {}
export interface GetPathFolderResponse extends PathBase {}

export interface MoveResponse {
    foldersCount: number
    items: ItemBase[]
}

export interface GetEntityResponse {
    entityType: string
    entity: GetItemResponse | GetFolderResponse | GetDriveResponse
}

export interface QueryChildrenResponse {
    items: GetItemResponse[]
    folders: GetFolderResponse[]
}

export interface QueryDeletedResponse {
    items: GetItemResponse[]
    folders: GetFolderResponse[]
}

export interface TrashItemResponse {}
export interface TrashFolderResponse {}
export interface DeleteDriveResponse {}

export interface PurgeDriveResponse {
    foldersCount: number
    itemsCount: number
    items: ItemBase[]
}
