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

export interface GetGroupResponse {
    id: string
    path: string
}

export interface CreateDriveResponse extends BaseDrive {}

export interface GetDriveResponse extends BaseDrive {}

export interface GetDefaultDriveResponse {
    driveId: string
    driveName: string
    downloadFolderId: string
    downloadFolderName: string
    homeFolderId: string
    homeFolderName: string
    systemFolderId: string
    systemFolderName: string
    systemPackageFolderId: string
    systemPackageFolderName: string
    groupId: string
}

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
    kind: string
    metadata: string
}

export interface GetFolderResponse extends FolderBase {}

export interface CreateFolderBody {
    name: string
    kind?: string
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
    assetId: string
    rawId: string
    folderId: string
    driveId: string
    groupId: string
    name: string
    kind: string
    borrowed: boolean
    metadata: string
}

export interface CreateItemBody {
    name: string
    kind?: string
    metadata?: string
    itemId?: string
    assetId: string
    borrowed?: boolean
}

export interface CreateItemResponse extends ItemBase {}

export interface UpdateItemBody {
    name: string
}

export interface UpdateItemResponse extends ItemBase {}

export interface PostMoveBody {
    targetId: string
    destinationFolderId: string
}

export interface PostBorrowBody {
    targetId?: string
    destinationFolderId: string
}

export interface GetItemResponse extends ItemBase {}

export interface ItemsBase {
    items: ItemBase[]
}
export interface QueryItemsByAssetIdResponse extends ItemsBase {}

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

export interface BorrowResponse extends GetItemResponse {}

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

export function isInstanceOfItemResponse(
    node: unknown,
): node is GetItemResponse {
    return (
        (node as GetItemResponse).assetId != undefined &&
        (node as GetItemResponse).rawId != undefined &&
        (node as GetItemResponse).itemId != undefined
    )
}

export function isInstanceOfFolderResponse(
    node: unknown,
): node is GetFolderResponse {
    return (
        (node as GetFolderResponse).parentFolderId != undefined &&
        (node as GetFolderResponse).folderId != undefined
    )
}

export function isInstanceOfGroupResponse(
    node: unknown,
): node is GetGroupResponse {
    return (
        (node as GetGroupResponse).path != undefined &&
        (node as GetGroupResponse).id != undefined
    )
}
