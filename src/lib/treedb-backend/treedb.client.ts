import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import {
    GetHealthzResponse,
    PutDriveBody,
    PostDriveBody,
    PutFolderBody,
    PostFolderBody,
    PutItemBody,
    PostItemBody,
    PostMoveBody,
    PutDriveResponse,
    GetDrivesResponse,
    PostDriveResponse,
    GetDriveResponse,
    GetFolderResponse,
    PostFolderResponse,
    PutFolderResponse,
    PutItemResponse,
    PostItemResponse,
    GetItemResponse,
    GetItemsByRelatedIdResponse,
    GetPathResponse,
    GetPathFolderResponse,
    PostMoveResponse,
    GetEntityResponse,
    GetChildrenResponse,
    GetDeletedResponse,
    DeleteItemResponse,
    DeleteFolderResponse,
    PurgeDriveResponse,
    DeleteDriveResponse,
} from './interfaces'
import { RootRouter } from '../router'

export class TreedbClient extends RootRouter {
    constructor({
        headers,
        basePath,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
    } = {}) {
        super({
            basePath: basePath || '/api/treedb-backend',
            headers,
        })
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<GetHealthzResponse> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }

    /**
     * Create a drive
     *
     * @param groupId
     * @param body
     * @param callerOptions
     */
    createDrive$({
        groupId,
        body,
        callerOptions,
    }: {
        groupId: string
        body: PutDriveBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PutDriveResponse> {
        return this.send$({
            command: 'create',
            path: `/groups/${groupId}/drives`,
            nativeRequestOptions: {
                json: body,
                method: 'PUT',
            },
            callerOptions,
        })
    }

    /**
     * List the drives of a particular group
     *
     * @param groupId
     * @param callerOptions
     */
    queryDrives$({
        groupId,
        callerOptions,
    }: {
        groupId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetDrivesResponse> {
        return this.send$({
            command: 'query',
            path: `/groups/${groupId}/drives`,
            callerOptions,
        })
    }

    /**
     * Update a drive.
     *
     * @param driveId
     * @param body
     * @param callerOptions
     */
    updateDrive$({
        driveId,
        body,
        callerOptions,
    }: {
        driveId: string
        body: PostDriveBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PostDriveResponse> {
        return this.send$({
            command: 'update',
            path: `/drives/${driveId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Retrieve a drive.
     *
     * @param driveId
     * @param body
     * @param callerOptions
     */
    getDrive$({
        driveId,
        callerOptions,
    }: {
        driveId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetDriveResponse> {
        return this.send$({
            command: 'query',
            path: `/drives/${driveId}`,
            callerOptions,
        })
    }

    /**
     * Create a folder.
     *
     * @param parentFolderId
     * @param body
     * @param callerOptions
     */
    createFolder$({
        parentFolderId,
        body,
        callerOptions,
    }: {
        parentFolderId: string
        body: PutFolderBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PutFolderResponse> {
        return this.send$({
            command: 'create',
            path: `/folders/${parentFolderId}`,
            nativeRequestOptions: {
                json: body,
                method: 'PUT',
            },
            callerOptions,
        })
    }

    /**
     * Update a folder
     *
     * @param folderId
     * @param body
     * @param callerOptions
     */
    updateFolder$({
        folderId,
        body,
        callerOptions,
    }: {
        folderId: string
        body: PostFolderBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PostFolderResponse> {
        return this.send$({
            command: 'update',
            path: `/folders/${folderId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Retrieve a folder
     *
     * @param folderId
     * @param callerOptions
     */
    getFolder$({
        folderId,
        callerOptions,
    }: {
        folderId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetFolderResponse> {
        return this.send$({
            command: 'query',
            path: `/folders/${folderId}`,
            callerOptions,
        })
    }

    /**
     * Create an item
     *
     * @param folderId
     * @param body
     * @param callerOptions
     */
    createItem$({
        folderId,
        body,
        callerOptions,
    }: {
        folderId: string
        body: PutItemBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PutItemResponse> {
        return this.send$({
            command: 'create',
            path: `/folders/${folderId}/items`,
            nativeRequestOptions: {
                json: body,
                method: 'PUT',
            },
            callerOptions,
        })
    }

    /**
     * Update an item
     *
     * @param itemId
     * @param body
     * @param callerOptions
     */
    updateItem$({
        itemId,
        body,
        callerOptions,
    }: {
        itemId: string
        body: PostItemBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PostItemResponse> {
        return this.send$({
            command: 'update',
            path: `/items/${itemId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Retrieve an item
     *
     * @param itemId
     * @param callerOptions
     */
    getItem$({
        itemId,
        callerOptions,
    }: {
        itemId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetItemResponse> {
        return this.send$({
            command: 'query',
            path: `/items/${itemId}`,
            callerOptions,
        })
    }

    /**
     * Retrieve items related to a particular 'relatedId' (i.e. assetId)
     *
     * @param relatedId
     * @param callerOptions
     */
    queryItemsByRelatedId$({
        relatedId,
        callerOptions,
    }: {
        relatedId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetItemsByRelatedIdResponse> {
        return this.send$({
            command: 'query',
            path: `/items/from-related/${relatedId}`,
            callerOptions,
        })
    }

    /**
     * Return the path of an item
     *
     * @param itemId
     * @param callerOptions
     */
    getPath$({
        itemId,
        callerOptions,
    }: {
        itemId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPathResponse> {
        return this.send$({
            command: 'query',
            path: `/items/${itemId}/path`,
            callerOptions,
        })
    }

    /**
     * Return the path of a folder
     * @param folderId
     * @param callerOptions
     */
    getPathFolder$({
        folderId,
        callerOptions,
    }: {
        folderId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPathFolderResponse> {
        return this.send$({
            command: 'query',
            path: `/folders/${folderId}/path`,
            callerOptions,
        })
    }

    /**
     * Move an item or folder in a different location
     *
     * @param body
     * @param callerOptions
     */
    move$({
        body,
        callerOptions,
    }: {
        body: PostMoveBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PostMoveResponse> {
        return this.send$({
            command: 'update',
            path: `/move`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Return an entity (either drive, folder, or item) from its id
     *
     * @param entityId
     * @param callerOptions
     */
    getEntity$({
        entityId,
        callerOptions,
    }: {
        entityId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetEntityResponse> {
        return this.send$({
            command: 'query',
            path: `/entities/${entityId}`,
            callerOptions,
        })
    }

    /**
     * Return the children of a folder or drive
     * @param parentId
     * @param callerOptions
     */
    queryChildren$({
        parentId,
        callerOptions,
    }: {
        parentId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetChildrenResponse> {
        return this.send$({
            command: 'query',
            path: `/folders/${parentId}/children`,
            callerOptions,
        })
    }

    /**
     * Return the list of deleted items of a drive
     *
     * @param driveId
     * @param callerOptions
     */
    queryDeleted$({
        driveId,
        callerOptions,
    }: {
        driveId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetDeletedResponse> {
        return this.send$({
            command: 'query',
            path: `/drives/${driveId}/deleted`,
            callerOptions,
        })
    }

    /**
     * Put into the 'trash' and item
     *
     * @param itemId
     * @param callerOptions
     */
    trashItem$({
        itemId,
        callerOptions,
    }: {
        itemId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteItemResponse> {
        return this.send$({
            command: 'delete',
            path: `/items/${itemId}`,
            callerOptions,
        })
    }

    /**
     * Put into the 'trash' a folder
     * @param folderId
     * @param callerOptions
     */
    trashFolder$({
        folderId,
        callerOptions,
    }: {
        folderId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteFolderResponse> {
        return this.send$({
            command: 'delete',
            path: `/folders/${folderId}`,
            callerOptions,
        })
    }

    /**
     * Purge 'trashed' items/folders of a drive
     *
     * @param driveId
     * @param callerOptions
     */
    purgeDrive$({
        driveId,
        callerOptions,
    }: {
        driveId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PurgeDriveResponse> {
        return this.send$({
            command: 'delete',
            path: `/drives/${driveId}/purge`,
            callerOptions,
        })
    }

    /**
     * Delete a drive - the drive needs to be empty
     * @param driveId
     * @param callerOptions
     */
    deleteDrive$({
        driveId,
        callerOptions,
    }: {
        driveId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteDriveResponse> {
        return this.send$({
            command: 'delete',
            path: `/drives/${driveId}`,
            callerOptions,
        })
    }
}
