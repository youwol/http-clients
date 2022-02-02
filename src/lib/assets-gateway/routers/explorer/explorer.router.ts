/** @format */

import { Observable } from 'rxjs'
import {
    ChildrenFolderResponse,
    DefaultDriveResponse,
    DriveId,
    DriveResponse,
    DrivesResponse,
    FolderId,
    FolderResponse,
    ItemId,
    ItemResponse,
    PermissionsResponse,
} from './interfaces'
import { CallerRequestOptions, HTTPError } from '../../../utils'
import { Router } from '../../../router'

export class GroupsRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/groups`)
    }

    /**
     * Drives registered for a particular group
     *
     * @param groupId group's id
     * @param callerOptions
     * @returns response
     */
    queryDrives$(
        groupId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<DrivesResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${groupId}/drives`,
            callerOptions,
        })
    }

    /**
     * Default drive of a particular group
     *
     * @param groupId group's id
     * @param callerOptions
     * @returns response
     */
    getDefaultDrive$(
        groupId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<DefaultDriveResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${groupId}/default-drive`,
            callerOptions,
        })
    }

    /**
     * Create a drive.
     *
     * @param groupId group in which the drive is created
     * @param body
     * @param body.name name of the drive
     * @param callerOptions
     * @returns response
     */
    createDrive$(
        groupId: string,
        body: { name: string },
        callerOptions: CallerRequestOptions = {},
    ): Observable<DriveResponse | HTTPError> {
        return this.send$({
            command: 'create',
            path: `/${groupId}/drives`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }
}

export class DrivesRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/drives`)
    }

    /**
     * Get a drive of particular id
     * @param driveId drive's id
     * @param callerOptions
     * @returns response
     */
    get$(
        driveId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<DriveResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${driveId}`,
            callerOptions,
        })
    }

    /**
     * delete a drive
     * @param driveId drive's id
     * @param callerOptions
     * @returns response
     */
    delete$(
        driveId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<Record<string, never> | HTTPError> {
        return this.send$({
            command: 'delete',
            path: `/${driveId}`,
            callerOptions,
        })
    }

    /**
     * Purge all items of a drive
     *
     * @param driveId drive's id
     * @param callerOptions
     * @returns
     */
    purge$(
        driveId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<{ foldersCount: number } | HTTPError> {
        return this.send$({
            command: 'delete',
            path: `/${driveId}/purge`,
            callerOptions,
        })
    }

    /**
     * Rename a drive
     *
     * @param driveId drive's id
     * @param body
     * @param body.name new name
     * @param callerOptions
     */
    rename$(
        driveId: string,
        body: { name: string },
        callerOptions: CallerRequestOptions = {},
    ): Observable<DriveResponse | HTTPError> {
        return this.send$({
            command: 'update',
            path: `/${driveId}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }

    /**
     * Return the list of deleted items (i.e. belonging to the trash folder)
     * @param driveId drive's id
     * @param callerOptions
     */
    queryDeletedItems$(
        driveId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<ChildrenFolderResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${driveId}/deleted`,
            callerOptions,
        })
    }
}

export class FoldersRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/folders`)
    }

    /**
     * Query the children of a folder.
     *
     * @param folderId
     * @param callerOptions
     */
    queryChildren$(
        folderId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<ChildrenFolderResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${folderId}/children`,
            callerOptions,
        })
    }

    /**
     * Create a folder
     *
     * @param parentFolderId parent folder id
     * @param body
     * @param body.name name of the folder
     * @param callerOptions
     * @returns response
     */
    create$(
        parentFolderId: string,
        body: { name: string },
        callerOptions: CallerRequestOptions = {},
    ): Observable<FolderResponse | HTTPError> {
        return this.send$({
            command: 'create',
            path: `/${parentFolderId}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }

    /**
     * delete a folder
     * @param folderId folder's id
     * @param callerOptions
     * @returns response
     */
    delete$(
        folderId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<Record<string, never> | HTTPError> {
        return this.send$({
            command: 'delete',
            path: `/${folderId}`,
            callerOptions,
        })
    }

    /**
     * Rename a folder
     *
     * @param folderId folder's id
     * @param body
     * @param body.name new name
     * @param callerOptions
     * @returns response
     */
    rename$(
        folderId: FolderId,
        body: { name: string },
        callerOptions: CallerRequestOptions = {},
    ): Observable<FolderResponse | HTTPError> {
        return this.send$({
            command: 'update',
            path: `/${folderId}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }
}

export class ItemsRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/items`)
    }

    /**
     * Retrieve item of particular id
     *
     * @param itemId id of the item
     * @param callerOptions
     * @returns response
     */
    get$(
        itemId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<ItemResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${itemId}`,
            callerOptions,
        })
    }

    /**
     * Delete an item
     *
     * @param itemId id of the item
     * @param callerOptions
     * @returns response
     */
    delete$(
        itemId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<Record<string, never> | HTTPError> {
        return this.send$({
            command: 'delete',
            path: `/${itemId}`,
            callerOptions,
        })
    }
}

export class ExplorerRouter extends Router {
    public readonly groups: GroupsRouter
    public readonly drives: DrivesRouter
    public readonly folders: FoldersRouter
    public readonly items: ItemsRouter

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/tree`)
        this.groups = new GroupsRouter(this)
        this.drives = new DrivesRouter(this)
        this.folders = new FoldersRouter(this)
        this.items = new ItemsRouter(this)
    }

    /**
     * Query the default drive of the user.
     *
     * @param callerOptions
     * @returns
     */
    getDefaultUserDrive$(
        callerOptions: CallerRequestOptions = {},
    ): Observable<DefaultDriveResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/default-drive`,
            callerOptions,
        })
    }

    /**
     * Create a symbolic link of folder or item.
     *
     * @param targetId id of the item of the folder
     * @param body
     * @param body.destination id of the destination folder/drive
     * @param callerOptions
     * @returns response
     */
    borrowItem$(
        targetId: ItemId | FolderId,
        body: { destinationFolderId: FolderId | DriveId },
        callerOptions: CallerRequestOptions = {},
    ): Observable<ItemResponse | HTTPError> {
        return this.send$({
            command: 'create',
            path: `/${targetId}/borrow`,
            nativeRequestOptions: { method: 'POST', json: body },
            callerOptions,
        })
    }

    /**
     * Retrieve the permission associated to an asset
     *
     * @param treeId tree-db's id of the asset
     * @param callerOptions
     */
    getPermissions$(
        treeId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<PermissionsResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${treeId}/permissions`,
            callerOptions,
        })
    }

    /**
     * Move an item of folder.
     *
     * @param targetId tree-db id of the item or folder
     * @param body
     * @param body.destinationFolderId destination folder's id
     * @param callerOptions
     */
    move$(
        targetId: ItemId | FolderId,
        body: { destinationFolderId: FolderId | DriveId },
        callerOptions: CallerRequestOptions = {},
    ): Observable<ChildrenFolderResponse | HTTPError> {
        return this.send$({
            command: 'update',
            path: `/${targetId}/move`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }
}
