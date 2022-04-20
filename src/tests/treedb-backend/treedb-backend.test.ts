// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import { resetPyYouwolDbs$, Shell } from '../common'
import '../mock-requests'
import { shell$ } from '../common'
import {
    createDrive,
    createFolder,
    createItem,
    deleteDrive,
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
    queryItemsByRelatedId,
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
} from '../../lib/treedb-backend'

jest.setTimeout(90 * 1000)
beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
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
            queryChildren(
                (shell) => ({
                    parentId: shell.homeFolderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(1)
                    expect(resp.items).toHaveLength(0)
                    return shell.context
                },
            ),
            queryChildren(
                (shell) => ({
                    parentId: shell.context.folder.folderId,
                }),
                (shell, resp) => {
                    // There is the default drive in it
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(0)
                    return shell.context
                },
            ),
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
            queryChildren(
                (shell) => ({
                    parentId: shell.homeFolderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(0)
                    return shell.context
                },
            ),
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
            purgeDrive(
                (shell) => ({
                    driveId: shell.defaultDriveId,
                }),
                (shell, resp) => {
                    expect(resp.foldersCount).toBe(1)
                    expect(resp.itemsCount).toBe(0)
                    return shell.context
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('happy path items', (done) => {
    class Context {
        public readonly item = {
            itemId: 'test-item-id',
            relatedId: 'test-item-related-id',
            name: 'test item',
            type: 'flux-project',
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
        expect(resp.type).toBe(shell.context.item.type)
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
            queryChildren(
                (shell) => ({
                    parentId: shell.homeFolderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(1)
                    expectItem(
                        resp.items[0],
                        shell,
                        shell.context.updatedItemName,
                    )
                    return shell.context
                },
            ),
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
            queryItemsByRelatedId(
                (shell) => ({
                    relatedId: shell.context.item.relatedId,
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
            trashItem((shell) => ({
                itemId: shell.context.item.itemId,
            })),
            queryChildren(
                (shell) => ({
                    parentId: shell.homeFolderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(0)
                    return shell.context
                },
            ),
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
            purgeDrive(
                (shell) => ({
                    driveId: shell.defaultDriveId,
                }),
                (shell, resp) => {
                    expect(resp.foldersCount).toBe(0)
                    expect(resp.itemsCount).toBe(1)
                    return shell.context
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('happy path move', (done) => {
    class Context {
        public readonly item = {
            itemId: 'test-item-id',
            relatedId: 'test-item-related-id',
            name: 'test item',
            type: 'flux-project',
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
            queryChildren(
                (shell) => ({
                    parentId: shell.context.folder.folderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(1)
                    return shell.context
                },
            ),
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
            queryChildren(
                (shell) => ({
                    parentId: shell.context.folder.folderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(0)
                    return shell.context
                },
            ),
            queryChildren(
                (shell) => ({
                    parentId: shell.homeFolderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(1)
                    expect(resp.items).toHaveLength(1)
                    return shell.context
                },
            ),
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
            queryChildren(
                (shell: Shell<Context>) => ({
                    parentId: shell.context.folder.folderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(1)
                    expect(resp.items).toHaveLength(0)
                    return shell.context
                },
            ),
            queryChildren(
                (shell: Shell<Context>) => ({
                    parentId: shell.context.folder2.folderId,
                }),
                (shell, resp) => {
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.items).toHaveLength(1)
                    return shell.context
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})
