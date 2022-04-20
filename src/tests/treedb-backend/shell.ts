import '../mock-requests'
import { expectAttributes, mapToShell, Shell } from '../common'
import { Observable } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import {
    GetChildrenResponse,
    GetDeletedResponse,
    GetDriveResponse,
    GetDrivesResponse,
    GetEntityResponse,
    GetFolderResponse,
    GetItemResponse,
    GetItemsByRelatedIdResponse,
    GetPathFolderResponse,
    GetPathResponse,
    PostDriveBody,
    PostDriveResponse,
    PostFolderBody,
    PostFolderResponse,
    PostItemBody,
    PostItemResponse,
    PostMoveBody,
    PostMoveResponse,
    PurgeDriveResponse,
    PutDriveBody,
    PutDriveResponse,
    PutFolderBody,
    PutFolderResponse,
    PutItemBody,
    PutItemResponse,
} from '../../lib/treedb-backend'

export function expectDrive(drive: unknown) {
    expectAttributes(drive, ['driveId', 'groupId', 'name', 'metadata'])
}

export function expectFolder(folder: unknown) {
    expectAttributes(folder, [
        'folderId',
        'parentFolderId',
        'driveId',
        'groupId',
        'name',
        'type',
        'metadata',
    ])
}

export function expectItem(item: unknown) {
    expectAttributes(item, [
        'itemId',
        'relatedId',
        'folderId',
        'driveId',
        'groupId',
        'name',
        'type',
        'metadata',
    ])
}

export function healthz<T>() {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.getHealthz$().pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expect(resp.status).toBe('treedb-backend ok')
                    }),
                    mapToShell(shell),
                )
            }),
        )
    }
}

export function createDrive<T>(
    input: (shell: Shell<T>) => {
        groupId: string
        body: PutDriveBody
    },
    cb?: (shell: Shell<T>, resp: PutDriveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.createDrive$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectDrive(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function queryDrives<T>(
    input: (shell: Shell<T>) => {
        groupId: string
    },
    cb?: (shell: Shell<T>, resp: GetDrivesResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.queryDrives$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['drives'])
                        resp.drives.forEach((drive) => {
                            expectDrive(drive)
                        })
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function updateDrive<T>(
    input: (shell: Shell<T>) => {
        driveId: string
        body: PostDriveBody
    },
    cb?: (shell: Shell<T>, resp: PostDriveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.updateDrive$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectDrive(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getDrive<T>(
    input: (shell: Shell<T>) => {
        driveId: string
    },
    cb?: (shell: Shell<T>, resp: GetDriveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.getDrive$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectDrive(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function createFolder<T>(
    input: (shell: Shell<T>) => {
        parentFolderId: string
        body: PutFolderBody
    },
    cb?: (shell: Shell<T>, resp: PutFolderResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.createFolder$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectFolder(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function updateFolder<T>(
    input: (shell: Shell<T>) => {
        folderId: string
        body: PostFolderBody
    },
    cb?: (shell: Shell<T>, resp: PostFolderResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.updateFolder$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectFolder(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getFolder<T>(
    input: (shell: Shell<T>) => {
        folderId: string
    },
    cb?: (shell: Shell<T>, resp: GetFolderResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.getFolder$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectFolder(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function createItem<T>(
    input: (shell: Shell<T>) => {
        folderId: string
        body: PutItemBody
    },
    cb?: (shell: Shell<T>, resp: PutItemResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.createItem$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectItem(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function updateItem<T>(
    input: (shell: Shell<T>) => {
        itemId: string
        body: PostItemBody
    },
    cb?: (shell: Shell<T>, resp: PostItemResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.updateItem$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectItem(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getItem<T>(
    input: (shell: Shell<T>) => {
        itemId: string
    },
    cb?: (shell: Shell<T>, resp: GetItemResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.getItem$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectItem(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function queryItemsByRelatedId<T>(
    input: (shell: Shell<T>) => {
        relatedId: string
    },
    cb?: (shell: Shell<T>, resp: GetItemsByRelatedIdResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb
                    .queryItemsByRelatedId$(input(shell))
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expectAttributes(resp, ['items'])
                            resp.items.forEach((item) => {
                                expectItem(item)
                            })
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function getPath<T>(
    input: (shell: Shell<T>) => {
        itemId: string
    },
    cb?: (shell: Shell<T>, resp: GetPathResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.getPath$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['item', 'folders', 'drive'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getFolderPath<T>(
    input: (shell: Shell<T>) => {
        folderId: string
    },
    cb?: (shell: Shell<T>, resp: GetPathFolderResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.getPathFolder$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['folders', 'drive'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function move<T>(
    input: (shell: Shell<T>) => {
        body: PostMoveBody
    },
    cb?: (shell: Shell<T>, resp: PostMoveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.move$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['foldersCount', 'items'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getEntity<T>(
    input: (shell: Shell<T>) => {
        entityId: string
    },
    cb?: (shell: Shell<T>, resp: GetEntityResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.getEntity$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['entityType', 'entity'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

function expectChildren(resp: { items: unknown[]; folders: unknown[] }) {
    expectAttributes(resp, ['items', 'folders'])
    resp.items.forEach((item) => expectItem(item))
    resp.folders.forEach((folder) => expectFolder(folder))
}

export function queryChildren<T>(
    input: (shell: Shell<T>) => {
        parentId: string
    },
    cb?: (shell: Shell<T>, resp: GetChildrenResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.queryChildren$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectChildren(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function queryDeleted<T>(
    input: (shell: Shell<T>) => {
        driveId: string
    },
    cb?: (shell: Shell<T>, resp: GetDeletedResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.queryDeleted$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectChildren(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function trashItem<T>(
    input: (shell: Shell<T>) => {
        itemId: string
    },
    cb?: (shell: Shell<T>, resp: null) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb
                    .trashItem$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function trashFolder<T>(
    input: (shell: Shell<T>) => {
        folderId: string
    },
    cb?: (shell: Shell<T>, resp: null) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb
                    .trashFolder$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function purgeDrive<T>(
    input: (shell: Shell<T>) => {
        driveId: string
    },
    cb?: (shell: Shell<T>, resp: PurgeDriveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb.purgeDrive$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, [
                            'foldersCount',
                            'itemsCount',
                            'items',
                        ])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function deleteDrive<T>(
    input: (shell: Shell<T>) => {
        driveId: string
    },
    cb?: (shell: Shell<T>, resp: null) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.treedb
                    .deleteDrive$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}
