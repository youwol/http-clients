import '../mock-requests'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import { map, mergeMap, tap } from 'rxjs/operators'
import { Observable, OperatorFunction } from 'rxjs'
import { readFileSync } from 'fs'
import {
    expectAssetAttributes,
    expectAttributes,
    mapToShell,
    Shell,
} from '../common'
import { GetLibraryInfoResponse } from '../../lib/cdn-backend'

type ManagedError = 'ManagedError'

export function uploadPackage<T>(
    filePath: string,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const buffer = readFileSync(filePath)
                const filename = filePath.split('/').slice(-1)[0]
                const arraybuffer = Uint8Array.from(buffer).buffer
                return shell.assetsGtw.cdn
                    .upload$({
                        body: {
                            fileName: filename,
                            blob: new Blob([arraybuffer]),
                        },
                        queryParameters: { folderId: shell.homeFolderId },
                    })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expectAssetAttributes(resp)
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function downloadPackage<T>(
    input: (shell: Shell<T>) => { libraryId: string; version: string },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.cdn.downloadLibrary(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expect(resp).toBeInstanceOf(Blob)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getInfo<T>(
    input: (shell: Shell<T>) => { libraryId: string },
    cb: (shell: Shell<T>, resp) => T,
    onError: OperatorFunction<
        GetLibraryInfoResponse | HTTPError,
        GetLibraryInfoResponse | ManagedError
    > = raiseHTTPErrors(),
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.cdn.getLibraryInfo$(input(shell)).pipe(
                    onError,
                    map((resp) => {
                        if (resp == 'ManagedError') return shell
                        expectAttributes(resp, [
                            'name',
                            'versions',
                            'namespace',
                            'id',
                            'releases',
                        ])
                        return new Shell({
                            ...shell,
                            context: cb(shell, resp),
                        })
                    }),
                )
            }),
        )
    }
}

export function getVersionInfo<T>(
    input: (shell: Shell<T>) => { libraryId: string; version: string },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.cdn.getVersionInfo$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, [
                            'name',
                            'version',
                            'id',
                            'namespace',
                            'type',
                            'fingerprint',
                        ])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getPackageFolderContent<T>(
    input: (shell: Shell<T>) => {
        libraryName: string
        restOfPath: string
        version: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.cdn.queryExplorer$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['folders', 'files'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function getEntryPoint<T>(
    input: (shell: Shell<T>) => {
        libraryId: string
        version: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.cdn
                    .getEntryPoint$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function getResource<T>(
    input: (shell: Shell<T>) => {
        libraryId: string
        version: string
        restOfPath: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.cdn
                    .getResource$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function deleteLibrary<T>(
    input: (shell: Shell<T>) => {
        libraryId: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.cdn.deleteLibrary$(input(shell)).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['deletedVersionsCount'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}
