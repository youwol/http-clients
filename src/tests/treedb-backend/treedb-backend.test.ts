// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import { Shell } from '../common'
import '../mock-requests'
import { shell$ } from '../common'
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
    healthz,
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
    FolderBase,
    GetDriveResponse,
    ItemBase,
} from '../../lib/explorer-backend'
import { createAsset, getAsset } from '../assets-backend/shell'
import { setup$ } from '../py-youwol/utils'

beforeEach(async (done) => {
    setup$({
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('healthz', (done) => {
    class Context {}

    shell$<Context>()
        .pipe(healthz())
        .subscribe(() => {
            done()
        })
})

test('happy path drives', (done) => {
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

    shell$<Context>(new Context())
        .pipe(
            createDrive(
                (shell) => ({
                    groupId: shell.privateGroupId,
                    body: shell.context.drive,
                }),
                (shell, resp) => {
                    expectDrive(resp, shell, shell.context.drive.name)
                    return shell.context
                },
            ),
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
                    expectDrive(
                        resp.entity,
                        shell,
                        shell.context.updatedDriveName,
                    )
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
        .subscribe(() => {
            done()
        })
})

test('happy path folders', (done) => {
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

    shell$<Context>(new Context())
        .pipe(
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
        .subscribe(() => {
            done()
        })
})

test('happy path items', (done) => {
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
    shell$<Context>(new Context())
        .pipe(
            createItem(
                (shell) => ({
                    folderId: shell.homeFolderId,
                    body: shell.context.item,
                }),
                (shell, resp) => {
                    expectItem(resp, shell, shell.context.item.name)
                    return shell.context
                },
            ),
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
            getItem(
                (shell) => ({
                    itemId: shell.context.item.itemId,
                }),
                (shell, resp) => {
                    expectItem(resp, shell, shell.context.updatedItemName)
                    return shell.context
                },
            ),
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
                    expectItem(
                        resp.items[0],
                        shell,
                        shell.context.updatedItemName,
                    )
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
                    expectItem(
                        resp.items[0],
                        shell,
                        shell.context.updatedItemName,
                    )
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
                sideEffects: (resp, shell) => {
                    expect(resp.foldersCount).toBe(0)
                    expect(resp.itemsCount).toBe(1)
                    expect(resp.errorsAssetDeletion).toHaveLength(1)
                    expect(resp.errorsAssetDeletion[0]).toBe(
                        shell.context.item.assetId,
                    )
                    expect(resp.errorsRawDeletion).toHaveLength(1)
                    expect(resp.errorsRawDeletion[0]).toBe(
                        shell.context.item.rawId,
                    )
                },
            }),
            /*purgeDrive(
                (shell) => ({
                    driveId: shell.defaultDriveId,
                }),
                (shell: Shell<Context>, resp) => {
                    expect(resp.foldersCount).toBe(0)
                    expect(resp.itemsCount).toBe(1)
                    expect(resp.errorsAssetDeletion).toHaveLength(1)
                    expect(resp.errorsAssetDeletion[0]).toBe(
                        shell.context.item.assetId,
                    )
                    expect(resp.errorsRawDeletion).toHaveLength(1)
                    expect(resp.errorsRawDeletion[0]).toBe(
                        shell.context.item.rawId,
                    )
                    return shell.context
                },
            ),*/
        )
        .subscribe(() => {
            done()
        })
})

test('happy path move', (done) => {
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
    shell$<Context>(new Context())
        .pipe(
            createFolder((shell) => ({
                parentFolderId: shell.homeFolderId,
                body: shell.context.folder,
            })),
            createItem((shell) => ({
                folderId: shell.context.folder.folderId,
                body: shell.context.item,
            })),
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
        .subscribe(() => {
            done()
        })
})

test('borrow item happy path', (done) => {
    class Context {
        public readonly item = {
            itemId: btoa('test-item-raw-id'),
            assetId: btoa('test-item-raw-id'),
            name: 'test item',
            kind: 'flux-project',
        }
        // To test 'borrow item' through assets-gtw an asset needs to be created (for permissions purpose)
        public readonly asset = {
            assetId: btoa('test-item-raw-id'),
            rawId: 'test-item-raw-id',
            kind: 'test-kind',
            name: 'test asset',
            description: 'an asset for test',
            tags: [],
            images: [],
            thumbnails: [],
            groupId: '',
        }
        public readonly folder = {
            folderId: 'test-folder-id',
            name: 'test folder',
        }
        public readonly updatedName: string = 'renamed test asset'
    }
    shell$<Context>(new Context())
        .pipe(
            createFolder((shell) => ({
                parentFolderId: shell.homeFolderId,
                body: shell.context.folder,
            })),
            createItem((shell) => ({
                folderId: shell.context.folder.folderId,
                body: shell.context.item,
            })),
            queryChildren<Context>({
                inputs: (shell) => ({
                    parentId: shell.context.folder.folderId,
                }),
                sideEffects: (resp) => {
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(1)
                },
            }),
            createAsset({
                inputs: (shell) => ({
                    body: shell.context.asset,
                }),
                newContext: (shell) => {
                    return shell.context
                },
            }),
            borrow((shell) => ({
                itemId: shell.context.item.itemId,
                body: {
                    destinationFolderId: shell.context.folder.folderId,
                },
            })),
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
                    assetId: shell.context.item.assetId,
                }),
                (shell, resp) => {
                    expect(resp.items).toHaveLength(2)
                    return shell.context
                },
            ),
            updateItem((shell) => ({
                itemId: shell.context.item.itemId,
                body: {
                    name: shell.context.updatedName,
                },
            })),
            /*
            Make sure renaming the 'reference' item of an asset also renames the asset
             */
            getAsset({
                inputs: (shell) => {
                    return { assetId: shell.context.asset.assetId }
                },
                sideEffects: (response, shell) => {
                    expect(response.name).toBe(shell.context.updatedName)
                },
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('default drive', (done) => {
    class Context {}
    shell$<Context>(new Context())
        .pipe(
            getDefaultUserDrive(),
            getDefaultDrive((shell) => ({
                groupId: shell.privateGroupId,
            })),
        )
        .subscribe(() => {
            done()
        })
})

test('default drive', (done) => {
    class Context {}
    shell$<Context>(new Context())
        .pipe(
            getDefaultUserDrive(),
            getDefaultDrive((shell) => ({
                groupId: shell.privateGroupId,
            })),
        )
        .subscribe(() => {
            done()
        })
})
