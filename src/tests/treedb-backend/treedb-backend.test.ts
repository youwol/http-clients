import { Shell, shell$ } from '../common'
import '../mock-requests'
import {
    borrow,
    createDrive,
    createFolder,
    createItem,
    deleteDrive,
    getDefaultDrive,
    getDefaultUserDrive,
    getDrive,
    getEntity,
    getFolder,
    getFolderPath,
    getItem,
    getPath,
    move,
    purgeDrive,
    queryChildren,
    queryDeleted,
    queryDrives,
    queryItemsByAssetId,
    trashFolder,
    trashItem,
    updateDrive,
    updateFolder,
    updateItem,
} from './shell'
import {
    BorrowResponse,
    CreateDriveResponse,
    FolderBase,
    GetDefaultDriveResponse,
    GetDriveResponse,
    ItemBase,
} from '../../lib/explorer-backend'
import {
    accessInfo,
    createAsset,
    getAccessPolicy,
    getAsset,
    upsertAccessPolicy,
} from '../assets-backend'
import { LocalYouwol } from '@youwol/http-primitives'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { firstValueFrom } from 'rxjs'

beforeEach(async () => {
    await firstValueFrom(
        LocalYouwol.setup$({
            localOnly: true,
            authId: 'int_tests_yw-users@test-user',
        }),
    )
})

test('happy path drives', async () => {
    class Context {
        public readonly drive = {
            driveId: 'test-drive-id',
            name: 'test drive',
        }
        public readonly updatedDriveName = 'updated drive name'
    }

    const expectDrive = (
        resp: GetDriveResponse,
        shell: Shell<Context>,
        name: string,
    ) => {
        expect(resp.groupId).toBe(shell.privateGroupId)
        expect(resp.name).toBe(name)
        expect(resp.driveId).toBe(shell.context.drive.driveId)
        return shell.context
    }

    const test$ = shell$<Context>(new Context()).pipe(
        createDrive({
            inputs: (shell) => ({
                groupId: shell.privateGroupId,
                body: shell.context.drive,
            }),
            sideEffects: (resp, shell) => {
                expectDrive(resp, shell, shell.context.drive.name)
            },
        }),
        updateDrive(
            (shell) => ({
                driveId: shell.context.drive.driveId,
                body: {
                    name: shell.context.updatedDriveName,
                },
            }),
            (shell, resp) => {
                expectDrive(resp, shell, shell.context.updatedDriveName)
                return shell.context
            },
        ),
        getDrive(
            (shell) => ({
                driveId: shell.context.drive.driveId,
            }),
            (shell, resp) => {
                expectDrive(resp, shell, shell.context.updatedDriveName)
                return shell.context
            },
        ),
        getEntity(
            (shell) => ({
                entityId: shell.context.drive.driveId,
            }),
            (shell, resp) => {
                expect(resp.entityType).toBe('drive')
                expectDrive(resp.entity, shell, shell.context.updatedDriveName)
                return shell.context
            },
        ),
        queryDrives(
            (shell) => ({
                groupId: shell.privateGroupId,
            }),
            (shell, resp) => {
                // There is the default drive in it
                expect(resp.drives).toHaveLength(2)
                expect(resp.drives[0].driveId).toBe(shell.defaultDriveId)
                expectDrive(
                    resp.drives[1],
                    shell,
                    shell.context.updatedDriveName,
                )
                return shell.context
            },
        ),
        deleteDrive((shell) => ({
            driveId: shell.context.drive.driveId,
        })),
        queryDrives(
            (shell) => ({
                groupId: shell.privateGroupId,
            }),
            (shell, resp) => {
                // There is the default drive in it
                expect(resp.drives).toHaveLength(1)
                expect(resp.drives[0].driveId).toBe(shell.defaultDriveId)
                return shell.context
            },
        ),
    )
    await firstValueFrom(test$)
})

test('happy path folders', async () => {
    class Context {
        public readonly folder = {
            folderId: 'test-folder-id',
            name: 'test folder',
        }
        public readonly updatedFolderName = 'updated folder name'
    }

    const expectFolder = (
        resp: FolderBase,
        shell: Shell<Context>,
        name: string,
    ) => {
        expect(resp.groupId).toBe(shell.privateGroupId)
        expect(resp.name).toBe(name)
        expect(resp.driveId).toBe(shell.defaultDriveId)
        expect(resp.parentFolderId).toBe(shell.homeFolderId)
        return shell.context
    }

    const test$ = shell$<Context>(new Context()).pipe(
        createFolder(
            (shell) => ({
                parentFolderId: shell.homeFolderId,
                body: shell.context.folder,
            }),
            (shell, resp) => {
                expectFolder(resp, shell, shell.context.folder.name)
                return shell.context
            },
        ),
        updateFolder(
            (shell) => ({
                folderId: shell.context.folder.folderId,
                body: {
                    name: shell.context.updatedFolderName,
                },
            }),
            (shell, resp) => {
                expectFolder(resp, shell, shell.context.updatedFolderName)
                return shell.context
            },
        ),
        getFolder(
            (shell) => ({
                folderId: shell.context.folder.folderId,
            }),
            (shell, resp) => {
                expectFolder(resp, shell, shell.context.updatedFolderName)
                return shell.context
            },
        ),
        getEntity(
            (shell) => ({
                entityId: shell.context.folder.folderId,
            }),
            (shell, resp) => {
                expect(resp.entityType).toBe('folder')
                expectFolder(
                    resp.entity as FolderBase,
                    shell,
                    shell.context.updatedFolderName,
                )
                return shell.context
            },
        ),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.homeFolderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(1)
                expect(resp.items).toHaveLength(0)
            },
        }),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.context.folder.folderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(0)
            },
        }),
        getFolderPath(
            (shell) => ({
                folderId: shell.context.folder.folderId,
            }),
            (shell, resp) => {
                expect(resp.folders).toHaveLength(2)
                expect(resp.folders[0].name).toBe('Home')
                expectFolder(
                    resp.folders[1],
                    shell,
                    shell.context.updatedFolderName,
                )
                expect(resp.drive.driveId).toBe(shell.defaultDriveId)
                return shell.context
            },
        ),
        trashFolder((shell) => ({
            folderId: shell.context.folder.folderId,
        })),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.homeFolderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(0)
            },
        }),
        queryDeleted(
            (shell) => ({
                driveId: shell.defaultDriveId,
            }),
            (shell, resp) => {
                expect(resp.folders).toHaveLength(1)
                expect(resp.items).toHaveLength(0)
                return shell.context
            },
        ),
        purgeDrive({
            inputs: (shell) => ({
                driveId: shell.defaultDriveId,
            }),
            sideEffects: (resp) => {
                expect(resp.foldersCount).toBe(1)
                expect(resp.itemsCount).toBe(0)
            },
        }),
    )
    await firstValueFrom(test$)
})

test('happy path items', async () => {
    class Context {
        public readonly item = {
            itemId: 'test-item-id',
            rawId: 'test-item-raw-id',
            assetId: btoa('test-item-raw-id'),
            name: 'test item',
            kind: 'flux-project',
        }
        public readonly updatedItemName = 'updated item name'
    }

    const expectItem = (
        resp: ItemBase,
        shell: Shell<Context>,
        name: string,
    ) => {
        expect(resp.groupId).toBe(shell.privateGroupId)
        expect(resp.name).toBe(name)
        expect(resp.driveId).toBe(shell.defaultDriveId)
        expect(resp.folderId).toBe(shell.homeFolderId)
        expect(resp.kind).toBe(shell.context.item.kind)
        return shell.context
    }
    const test$ = shell$<Context>(new Context()).pipe(
        createItem({
            inputs: (shell) => ({
                folderId: shell.homeFolderId,
                body: shell.context.item,
            }),
            sideEffects: (resp, shell) => {
                expectItem(resp, shell, shell.context.item.name)
            },
        }),
        updateItem(
            (shell) => ({
                itemId: shell.context.item.itemId,
                body: {
                    name: shell.context.updatedItemName,
                },
            }),
            (shell, resp) => {
                expectItem(resp, shell, shell.context.updatedItemName)
                return shell.context
            },
        ),
        getItem({
            inputs: (shell) => ({
                itemId: shell.context.item.itemId,
            }),
            sideEffects: (resp, shell) => {
                expectItem(resp, shell, shell.context.updatedItemName)
            },
        }),
        getEntity(
            (shell) => ({
                entityId: shell.context.item.itemId,
            }),
            (shell, resp) => {
                expect(resp.entityType).toBe('item')
                expectItem(
                    resp.entity as ItemBase,
                    shell,
                    shell.context.updatedItemName,
                )
                return shell.context
            },
        ),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.homeFolderId,
            }),
            sideEffects: (resp, shell) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(1)
                expectItem(resp.items[0], shell, shell.context.updatedItemName)
            },
        }),
        getPath(
            (shell) => ({
                itemId: shell.context.item.itemId,
            }),
            (shell, resp) => {
                expectItem(resp.item, shell, shell.context.updatedItemName)
                expect(resp.folders).toHaveLength(1)
                expect(resp.folders[0].name).toBe('Home')
                expect(resp.drive.driveId).toBe(shell.defaultDriveId)
                return shell.context
            },
        ),
        queryItemsByAssetId(
            (shell) => ({
                assetId: shell.context.item.assetId,
            }),
            (shell, resp) => {
                expect(resp.items).toHaveLength(1)
                expectItem(resp.items[0], shell, shell.context.updatedItemName)
                return shell.context
            },
        ),
        trashItem({
            inputs: (shell) => ({ itemId: shell.context.item.itemId }),
        }),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.homeFolderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(0)
            },
        }),
        queryDeleted(
            (shell) => ({
                driveId: shell.defaultDriveId,
            }),
            (shell, resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(1)
                return shell.context
            },
        ),
        purgeDrive<Context>({
            inputs: (shell) => ({ driveId: shell.defaultDriveId }),
            authorizedErrors: (err) => {
                // The scenario here - having an item with no associated asset - is actually not supported.
                // When trying to delete, an error occurs (asset is not found) => we escape it here and assert some parts
                // of the error.
                const detail = err.body['detail']
                expect(detail.treedbResp.foldersCount).toBe(0)
                expect(detail.treedbResp.itemsCount).toBe(1)
                expect(detail.errorsAssetDeletion).toHaveLength(1)
                expect(detail.errorsRawDeletion).toHaveLength(1)
                return err.status == 500
            },
        }),
    )
    await firstValueFrom(test$)
})

test('happy path move', async () => {
    class Context {
        public readonly item = {
            itemId: 'test-item-id',
            assetId: btoa('test-item-raw-id'),
            name: 'test item',
            kind: 'flux-project',
        }
        public readonly folder = {
            folderId: 'test-folder-id',
            name: 'test folder',
        }
        public readonly folder2 = {
            folderId: 'test-folder-id-2',
            name: 'test folder 2',
        }
    }
    const test$ = shell$<Context>(new Context()).pipe(
        createFolder((shell) => ({
            parentFolderId: shell.homeFolderId,
            body: shell.context.folder,
        })),
        createItem({
            inputs: (shell) => ({
                folderId: shell.context.folder.folderId,
                body: shell.context.item,
            }),
        }),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.homeFolderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(1)
                expect(resp.items).toHaveLength(0)
            },
        }),
        move(
            (shell) => ({
                body: {
                    targetId: shell.context.item.itemId,
                    destinationFolderId: shell.homeFolderId,
                },
            }),
            (shell, resp) => {
                expect(resp.foldersCount).toBe(0)
                expect(resp.items).toHaveLength(1)
                return shell.context
            },
        ),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.context.folder.folderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(0)
            },
        }),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.homeFolderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(1)
                expect(resp.items).toHaveLength(1)
            },
        }),
        createFolder((shell) => ({
            parentFolderId: shell.homeFolderId,
            body: shell.context.folder2,
        })),
        move((shell) => ({
            body: {
                targetId: shell.context.item.itemId,
                destinationFolderId: shell.context.folder2.folderId,
            },
        })),
        move((shell) => ({
            body: {
                targetId: shell.context.folder2.folderId,
                destinationFolderId: shell.context.folder.folderId,
            },
        })),
        queryChildren<Context>({
            inputs: (shell) => ({
                parentId: shell.context.folder.folderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(1)
                expect(resp.items).toHaveLength(0)
            },
        }),
        queryChildren<Context>({
            inputs: (shell) => ({
                parentId: shell.context.folder2.folderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(1)
            },
        }),
    )
    await firstValueFrom(test$)
})

test('happy path move item in different group', async () => {
    class Context {
        public readonly assetCreated: NewAssetResponse<unknown>
        public readonly itemCreated: ItemBase

        public readonly bodyNewAsset = {
            assetId: 'test-asset-id',
            rawId: 'test-related-id',
            kind: 'test-kind',
            name: 'test asset',
            description: '',
        }
        public readonly ywUserGroupId = window.btoa('/youwol-users')

        public readonly ywUserDefaultDrive: GetDefaultDriveResponse

        constructor(
            params: {
                ywUserDefaultDrive?: GetDefaultDriveResponse
                assetCreated?: NewAssetResponse<unknown>
                itemCreated?: ItemBase
            } = {},
        ) {
            Object.assign(this, params)
        }
    }
    const test$ = shell$<Context>(new Context()).pipe(
        createAsset({
            inputs: (shell) => ({
                body: shell.context.bodyNewAsset,
                queryParameters: { folderId: shell.homeFolderId },
            }),
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, assetCreated: resp })
            },
        }),
        queryChildren({
            inputs: (shell) => ({
                parentId: shell.homeFolderId,
            }),
            sideEffects: (resp) => {
                expect(resp.items).toHaveLength(1)
            },
            newContext: (shell, resp) => {
                return new Context({
                    ...shell.context,
                    itemCreated: resp.items[0],
                })
            },
        }),
        // This test is to cut/paste in other group => get a different drive
        getDefaultDrive(
            (shell) => ({
                groupId: shell.context.ywUserGroupId,
            }),
            (shell, resp) => {
                return new Context({
                    ...shell.context,
                    ywUserDefaultDrive: resp,
                })
            },
        ),
        move(
            (shell) => {
                return {
                    body: {
                        targetId: shell.context.itemCreated.itemId,
                        destinationFolderId:
                            shell.context.ywUserDefaultDrive.homeFolderId,
                    },
                }
            },
            (shell, resp) => {
                expect(resp.foldersCount).toBe(0)
                expect(resp.items).toHaveLength(1)
                expect(resp.items[0].groupId).toBe(
                    shell.context.ywUserDefaultDrive.groupId,
                )
                return new Context({
                    ...shell.context,
                })
            },
        ),
        getAsset<Context>({
            inputs: (shell) => ({
                assetId: shell.context.assetCreated.assetId,
            }),
            sideEffects: (resp, shell) => {
                expect(resp.groupId).toBe(
                    shell.context.ywUserDefaultDrive.groupId,
                )
            },
        }),
    )
    await firstValueFrom(test$)
})

test('borrow item happy path', async () => {
    class Context {
        // To test 'borrow item' through assets-gtw an asset needs to be created (for permissions purpose)
        public readonly asset = {
            rawId: 'test-item-raw-id',
            kind: 'test-kind',
            name: 'test asset',
            description: 'an asset for test',
            tags: [],
            images: [],
            thumbnails: [],
        }
        public readonly folder = {
            folderId: 'test-folder-id',
            name: 'test folder',
        }
        public readonly updatedName: string = 'renamed test asset'

        public readonly groupId: string

        public readonly ywUserGroupId = window.btoa('/youwol-users')
        public readonly borrowedYwUsers: BorrowResponse
        public readonly ywUsersDrive: CreateDriveResponse
        public readonly assetId: string
        public readonly itemId: string
        constructor(
            params: {
                groupId?: string
                borrowedYwUsers?: BorrowResponse
                ywUsersDrive?: CreateDriveResponse
                assetId?: string
                itemId?: string
            } = {},
        ) {
            Object.assign(this, params)
        }
    }
    const test$ = shell$<Context>(new Context()).pipe(
        createFolder((shell) => ({
            parentFolderId: shell.homeFolderId,
            body: shell.context.folder,
        })),
        createAsset({
            inputs: (shell) => ({
                body: {
                    ...shell.context.asset,
                    groupId: shell.context.groupId,
                },
                queryParameters: {
                    folderId: shell.context.folder.folderId,
                },
            }),
            newContext: (shell, resp) => {
                expect(resp.itemId).toBe(resp.assetId)
                return new Context({
                    ...shell.context,
                    groupId: resp.groupId,
                    assetId: resp.assetId,
                    itemId: resp.itemId,
                })
            },
        }),
        queryChildren<Context>({
            inputs: (shell) => ({
                parentId: shell.context.folder.folderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(1)
            },
        }),
        borrow<Context>({
            inputs: (shell) => ({
                itemId: shell.context.itemId,
                body: {
                    destinationFolderId: shell.context.folder.folderId,
                },
            }),
        }),
        queryChildren<Context>({
            inputs: (shell) => ({
                parentId: shell.context.folder.folderId,
            }),
            sideEffects: (resp) => {
                expect(resp.folders).toHaveLength(0)
                expect(resp.items).toHaveLength(2)
                const original = resp.items[0]
                const borrowed = resp.items[1]
                expect(original.assetId).toEqual(original.itemId)
                expect(original.borrowed).toBeFalsy()
                expect(borrowed.borrowed).toBeTruthy()
                expect(borrowed.assetId == borrowed.itemId).toBeFalsy()
            },
        }),
        queryItemsByAssetId(
            (shell) => ({
                assetId: shell.context.assetId,
            }),
            (shell, resp) => {
                expect(resp.items).toHaveLength(2)
                return shell.context
            },
        ),
        updateItem((shell) => ({
            itemId: shell.context.itemId,
            body: {
                name: shell.context.updatedName,
            },
        })),
        /*
            Make sure renaming the 'reference' item of an asset also renames the asset
             */
        getAsset({
            inputs: (shell) => {
                return { assetId: shell.context.itemId }
            },
            sideEffects: (response, shell) => {
                expect(response.name).toBe(shell.context.updatedName)
            },
        }),
        upsertAccessPolicy<Context>({
            inputs: (shell) => {
                return {
                    assetId: shell.context.assetId,
                    groupId: '*',
                    body: {
                        read: 'forbidden',
                        share: 'authorized',
                    },
                }
            },
        }),
        getAccessPolicy<Context>({
            inputs: (shell) => {
                return {
                    assetId: shell.context.assetId,
                    groupId: shell.context.groupId,
                }
            },
            sideEffects: (resp) => {
                expect(resp.read).toBe('owning')
            },
        }),
        accessInfo<Context>({
            inputs: (shell) => {
                return {
                    assetId: shell.context.assetId,
                }
            },
            sideEffects: (resp) => {
                expect(resp.ownerInfo.exposingGroups).toHaveLength(0)
                expect(resp.ownerInfo.defaultAccess.read).toBe('forbidden')
                expect(resp.ownerInfo.defaultAccess.share).toBe('authorized')
            },
        }),
        // Make sure borrowing in another group create required access policies
        createDrive<Context>({
            inputs: (shell) => ({
                groupId: shell.context.ywUserGroupId,
                body: {
                    name: 'drive youwol-user',
                },
            }),
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, ywUsersDrive: resp })
            },
        }),
        borrow<Context>({
            inputs: (shell) => {
                return {
                    itemId: shell.context.itemId,
                    body: {
                        destinationFolderId: shell.context.ywUsersDrive.driveId,
                    },
                }
            },
            newContext: (shell, resp) => {
                return new Context({
                    ...shell.context,
                    borrowedYwUsers: resp,
                })
            },
        }),
        getAccessPolicy<Context>({
            inputs: (shell) => {
                return {
                    assetId: shell.context.itemId,
                    groupId: shell.context.ywUserGroupId,
                }
            },
            sideEffects: (resp) => {
                expect(resp.read).toBe('authorized')
                expect(resp.share).toBe('authorized')
            },
        }),
        accessInfo<Context>({
            inputs: (shell) => {
                return {
                    assetId: shell.context.itemId,
                }
            },
            sideEffects: (resp) => {
                expect(resp.ownerInfo.exposingGroups).toHaveLength(1)
                expect(resp.ownerInfo.exposingGroups[0].name).toBe(
                    '/youwol-users',
                )
                expect(resp.ownerInfo.defaultAccess.read).toBe('forbidden')
                expect(resp.ownerInfo.defaultAccess.share).toBe('authorized')
            },
        }),
        trashItem<Context>({
            inputs: (shell) => ({
                itemId: shell.context.borrowedYwUsers.itemId,
            }),
            sideEffects: (resp) => {
                expect(resp).toBeTruthy()
            },
        }),
        purgeDrive<Context>({
            inputs: (shell) => {
                return {
                    driveId: shell.context.ywUsersDrive.driveId,
                }
            },
        }),
        getAccessPolicy<Context>({
            inputs: (shell) => {
                return {
                    assetId: shell.context.assetId,
                    groupId: shell.context.ywUserGroupId,
                }
            },
            sideEffects: (resp) => {
                expect(resp.read).toBe('forbidden')
                expect(resp.share).toBe('authorized')
            },
        }),
        accessInfo<Context>({
            inputs: (shell) => {
                return {
                    assetId: shell.context.assetId,
                }
            },
            sideEffects: (resp) => {
                expect(resp.ownerInfo.exposingGroups).toHaveLength(0)
            },
        }),
    )
    await firstValueFrom(test$)
})

test('default drive', async () => {
    class Context {}
    const test$ = shell$<Context>(new Context()).pipe(
        getDefaultUserDrive(),
        getDefaultDrive((shell) => ({
            groupId: shell.privateGroupId,
        })),
    )
    const resp = await firstValueFrom(test$)
    expect(resp).toBeTruthy()
})
