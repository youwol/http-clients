import '../mock-requests'
import { expectAttributes, mapToShell, Shell } from '../common'
import { Observable } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import {
    QueryChildrenResponse,
    QueryDeletedResponse,
    GetDriveResponse,
    QueryDrivesResponse,
    GetEntityResponse,
    GetFolderResponse,
    GetItemResponse,
    QueryItemsByAssetIdResponse,
    GetPathFolderResponse,
    GetPathResponse,
    UpdateDriveBody,
    UpdateDriveResponse,
    UpdateFolderBody,
    UpdateFolderResponse,
    UpdateItemBody,
    UpdateItemResponse,
    PostMoveBody,
    MoveResponse,
    PurgeDriveResponse,
    CreateDriveBody,
    CreateDriveResponse,
    CreateFolderBody,
    CreateFolderResponse,
    CreateItemBody,
    CreateItemResponse,
    PostBorrowBody,
} from '../../lib/explorer-backend'

export function expectDrive(drive: unknown) {
    expectAttributes(drive, ['driveId', 'groupId', 'name', 'metadata'])
}

export function expectDefaultDrive(drive: unknown) {
    expectAttributes(drive, [
        'driveId',
        'groupId',
        'driveName',
        'downloadFolderId',
        'downloadFolderName',
        'homeFolderId',
        'homeFolderName',
        'systemFolderId',
        'systemFolderName',
        'systemPackagesFolderId',
        'systemPackagesFolderName',
    ])
}

export function expectFolder(folder: unknown) {
    expectAttributes(folder, [
        'folderId',
        'parentFolderId',
        'driveId',
        'groupId',
        'name',
        'kind',
        'metadata',
    ])
}

export function expectItem(item: unknown) {
    expectAttributes(item, [
        'itemId',
        'assetId',
        'rawId',
        'folderId',
        'driveId',
        'groupId',
        'name',
        'kind',
        'metadata',
        'borrowed',
    ])
}

export function healthz<T>() {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.getHealthz$().pipe(
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
        body: CreateDriveBody
    },
    cb?: (shell: Shell<T>, resp: CreateDriveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.createDrive$(input(shell)).pipe(
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
    cb?: (shell: Shell<T>, resp: QueryDrivesResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.queryDrives$(input(shell)).pipe(
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

export function getDefaultUserDrive<T>(
    cb?: (shell: Shell<T>, resp: QueryDrivesResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.getDefaultUserDrive$().pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectDefaultDrive(resp)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getDefaultDrive<T>(
    input: (shell: Shell<T>) => {
        groupId: string
    },
    cb?: (shell: Shell<T>, resp: QueryDrivesResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer
                    .getDefaultDrive$(input(shell))
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expectDefaultDrive(resp)
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
        body: UpdateDriveBody
    },
    cb?: (shell: Shell<T>, resp: UpdateDriveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.updateDrive$(input(shell)).pipe(
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
                return shell.assetsGtw.explorer.getDrive$(input(shell)).pipe(
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
        body: CreateFolderBody
    },
    cb?: (shell: Shell<T>, resp: CreateFolderResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer
                    .createFolder$(input(shell))
                    .pipe(
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
        body: UpdateFolderBody
    },
    cb?: (shell: Shell<T>, resp: UpdateFolderResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer
                    .updateFolder$(input(shell))
                    .pipe(
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
                return shell.assetsGtw.explorer.getFolder$(input(shell)).pipe(
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
        body: CreateItemBody
    },
    cb?: (shell: Shell<T>, resp: CreateItemResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.createItem$(input(shell)).pipe(
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
        body: UpdateItemBody
    },
    cb?: (shell: Shell<T>, resp: UpdateItemResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.updateItem$(input(shell)).pipe(
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
                return shell.assetsGtw.explorer.getItem$(input(shell)).pipe(
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

export function queryItemsByAssetId<T>(
    input: (shell: Shell<T>) => {
        assetId: string
    },
    cb?: (shell: Shell<T>, resp: QueryItemsByAssetIdResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer
                    .queryItemsByAssetId$(input(shell))
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
                return shell.assetsGtw.explorer.getPath$(input(shell)).pipe(
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
                return shell.assetsGtw.explorer
                    .getPathFolder$(input(shell))
                    .pipe(
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
    cb?: (shell: Shell<T>, resp: MoveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.move$(input(shell)).pipe(
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

export function borrow<T>(
    input: (shell: Shell<T>) => {
        itemId: string
        body: PostBorrowBody
    },
    cb?: (shell: Shell<T>, resp: MoveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.borrow$(input(shell)).pipe(
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

export function getEntity<T>(
    input: (shell: Shell<T>) => {
        entityId: string
    },
    cb?: (shell: Shell<T>, resp: GetEntityResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer.getEntity$(input(shell)).pipe(
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
    cb?: (shell: Shell<T>, resp: QueryChildrenResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer
                    .queryChildren$(input(shell))
                    .pipe(
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
    cb?: (shell: Shell<T>, resp: QueryDeletedResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.explorer
                    .queryDeleted$(input(shell))
                    .pipe(
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
                return shell.assetsGtw.explorer
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
                return shell.assetsGtw.explorer
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
                return shell.assetsGtw.explorer.purgeDrive$(input(shell)).pipe(
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
                return shell.assetsGtw.explorer
                    .deleteDrive$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}
