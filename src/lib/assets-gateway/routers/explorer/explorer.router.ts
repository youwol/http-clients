import { Observable } from "rxjs"
import { DeletedEntityResponse } from "../.."
import { ChildrenFolderResponse, DefaultDriveResponse, DriveId, DriveResponse, DrivesResponse, FolderId, FolderResponse, ItemId, ItemResponse } from "./interfaces"
import { RequestMonitoring } from "../../../utils"
import { Router } from "../../../router"


export class GroupsRouter extends Router {

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/groups`)
    }

    /**
     * Drives registered for a particular group
     *
     * @param groupId group's id
     * @param monitoring
     * @returns response
     */
    queryDrives$(
        groupId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<DrivesResponse> {

        return this.send$({
            command: 'query',
            path: `/${groupId}/drives`,
            monitoring
        })
    }


    /**
     * Default drive of a particular group
     *
     * @param groupId group's id
     * @param monitoring
     * @returns response
     */
    getDefaultDrive$(
        groupId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<DefaultDriveResponse> {

        return this.send$({
            command: 'query',
            path: `/${groupId}/default-drive`,
            monitoring
        })
    }

    /**
     * Create a drive.
     *
     * @param groupId group in which the drive is created
     * @param body
     * @param body.name name of the drive
     * @param monitoring
     * @returns response
     */
    createDrive$(
        groupId: string,
        body: { name: string },
        monitoring: RequestMonitoring = {}
    ): Observable<DriveResponse> {

        return this.send$({
            command: 'create',
            path: `/${groupId}/drives`,
            requestOptions: { json: body },
            monitoring
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
     * @param monitoring
     * @returns response
     */
    get$(
        driveId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<DriveResponse> {

        return this.send$({
            command: 'query',
            path: `/${driveId}`,
            monitoring
        })
    }


    /**
     * delete a drive
     * @param driveId drive's id
     * @param monitoring
     * @returns response
     */
    delete$(
        driveId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<{}> {

        return this.send$({
            command: 'delete',
            path: `/${driveId}`,
            monitoring
        })
    }

    /**
     * Purge all items of a drive 
     * 
     * @param driveId drive's id
     * @param monitoring
     * @returns 
     */
    purge$(
        driveId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<{ foldersCount: number }> {

        return this.send$({
            command: 'delete',
            path: `/${driveId}/purge`,
            monitoring
        })
    }

    /**
     * Rename a drive
     *
     * @param driveId drive's id
     * @param body
     * @param body.name new name
     * @param monitoring
     */
    rename$(
        driveId: string,
        body: { name: string },
        monitoring: RequestMonitoring = {}
    ): Observable<DriveResponse> {

        return this.send$({
            command: 'update',
            path: `/${driveId}`,
            requestOptions: { json: body },
            monitoring
        })
    }

    /**
     * Return the list of deleted items (i.e. belonging to the trash folder)
     * @param driveId drive's id
     * @param monitoring
     */
    queryDeletedItems$(
        driveId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<ChildrenFolderResponse> {

        return this.send$({
            command: 'query',
            path: `/${driveId}/deleted`,
            monitoring
        })
    }

}


export class FoldersRouter extends Router {

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/folders`)
    }

    queryChildren$(
        folderId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<ChildrenFolderResponse> {

        return this.send$({
            command: 'query',
            path: `/${folderId}/children`,
            monitoring
        })
    }

    /**
     * Create a folder
     *
     * @param parentFolderId parent folder id
     * @param body
     * @param body.name name of the folder
     * @param monitoring
     * @returns response
     */
    create$(
        parentFolderId: string,
        body: { name: string },
        monitoring: RequestMonitoring = {}
    ): Observable<FolderResponse> {

        return this.send$({
            command: 'create',
            path: `/${parentFolderId}`,
            requestOptions: { json: body },
            monitoring
        })
    }

    /**
     * delete a folder
     * @param folderId folder's id
     * @param monitoring
     * @returns response
     */
    delete$(
        folderId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<{}> {

        return this.send$({
            command: 'delete',
            path: `/${folderId}`,
            monitoring
        })
    }

    /**
     * Rename a folder
     *
     * @param folderId folder's id
     * @param body
     * @param body.name new name
     * @param monitoring
     * @returns response
     */
    rename$(
        folderId: FolderId,
        body: { name: string },
        monitoring: RequestMonitoring = {}
    ): Observable<FolderResponse> {

        return this.send$({
            command: 'update',
            path: `/${folderId}`,
            requestOptions: { json: body },
            monitoring
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
     * @param monitoring
     * @returns response
     */
    get$(
        itemId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<ItemResponse> {

        return this.send$({
            command: 'query',
            path: `/${itemId}`,
            monitoring
        })
    }

    /**
     * Delete an item
     *
     * @param itemId id of the item
     * @param monitoring
     * @returns response
     */
    delete$(
        itemId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<DeletedEntityResponse> {

        return this.send$({
            command: 'delete',
            path: `/${itemId}`,
            monitoring
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
     * @param monitoring
     * @returns 
     */
    getDefaultUserDrive$(
        monitoring: RequestMonitoring = {}
    ): Observable<DefaultDriveResponse> {

        return this.send$({
            command: 'query',
            path: `/default-drive`,
            monitoring
        })
    }

    /**
     * Create a symbolic link of folder or item.
     *
     * @param targetId id of the item of the folder
     * @param body
     * @param body.destination id of the destination folder/drive
     * @param monitoring
     * @returns response
     */
    borrowItem$(
        targetId: ItemId | FolderId,
        body: { destinationFolderId: FolderId | DriveId },
        monitoring: RequestMonitoring = {}
    ): Observable<ItemResponse> {

        return this.send$({
            command: 'create',
            path: `/${targetId}/borrow`,
            requestOptions: { method: 'POST', json: body },
            monitoring
        })
    }

    /**
     * Retrieve the permission associated to an asset
     *
     * @param treeId tree-db's id of the asset
     * @param monitoring
     */
    getPermissions$(
        treeId: string,
        monitoring: RequestMonitoring = {}
    ): Observable<ItemResponse> {


        return this.send$({
            command: 'query',
            path: `/${treeId}/permissions`,
            monitoring
        })
    }

    /**
     * Move an item of folder.
     *
     * @param targetId tree-db id of the item or folder
     * @param body
     * @param body.destinationFolderId destination folder's id
     * @param monitoring
     */
    move$(
        targetId: ItemId | FolderId,
        body: { destinationFolderId: FolderId | DriveId },
        monitoring: RequestMonitoring = {}
    ): Observable<ChildrenFolderResponse> {

        return this.send$({
            command: 'update',
            path: `/${targetId}/move`,
            requestOptions: { json: body },
            monitoring
        })
    }
}
