import '../mock-requests'
import {
    expectAttributes,
    mapToShell,
    newShellFromContext,
    Shell,
} from '../common'
import { Observable } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import { HTTPError, raiseHTTPErrors, wrap } from '@youwol/http-primitives'
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
    CreateDriveBody,
    CreateDriveResponse,
    CreateFolderBody,
    CreateFolderResponse,
    CreateItemBody,
    CreateItemResponse,
    PostBorrowBody,
    TrashItemResponse,
    PurgeDriveResponse,
    BorrowResponse,
} from '../../lib/explorer-backend'
import { AssetsGtwPurgeResponse } from '../../lib/assets-gateway'
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
        'tmpFolderId',
        'tmpFolderName',
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

export function createDrive<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        groupId: string
        body: CreateDriveBody
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: CreateDriveResponse) => TContext
}) {
    return wrap<Shell<TContext>, CreateDriveResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.explorer.createDrive$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectDrive(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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

export function createItem<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        folderId: string
        body: CreateItemBody
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: CreateItemResponse) => TContext
}) {
    return wrap<Shell<TContext>, CreateItemResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.explorer.createItem$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectItem(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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

export function getItem<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        itemId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: GetItemResponse) => TContext
}) {
    return wrap<Shell<TContext>, GetItemResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.explorer.getItem$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectItem(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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

export function borrow<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        itemId: string
        body: PostBorrowBody
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: BorrowResponse) => TContext
}) {
    return wrap<Shell<TContext>, BorrowResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.explorer.borrow$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectItem(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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

export function queryChildren<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        parentId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: QueryChildrenResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, QueryChildrenResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.explorer.queryChildren$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectChildren(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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

export function trashItem<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        itemId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: TrashItemResponse) => TContext
}) {
    return wrap<Shell<TContext>, TrashItemResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.explorer.trashItem$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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

export function purgeDrive<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        driveId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: PurgeDriveResponse | AssetsGtwPurgeResponse,
    ) => TContext
}) {
    return wrap<Shell<TContext>, PurgeDriveResponse | AssetsGtwPurgeResponse>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.explorer.purgeDrive$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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
