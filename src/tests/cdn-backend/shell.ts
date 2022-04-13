import '../mock-requests'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import {
    AssetsGatewayClient,
    DefaultDriveResponse,
} from '../../lib/assets-gateway'
import { map, mergeMap } from 'rxjs/operators'
import { Observable, OperatorFunction } from 'rxjs'
import { readFileSync } from 'fs'
import { expectAssetAttributes, expectAttributes } from '../common'
import { LibraryInfoResponse } from '../../lib/cdn-backend'

type ManagedError = 'ManagedError'

export class Shell<T> {
    homeFolderId: string
    assetsGtw: AssetsGatewayClient
    data: T
    constructor(params: {
        homeFolderId: string
        assetsGtw: AssetsGatewayClient
        data?: T
    }) {
        Object.assign(this, params)
    }
}

export function shell$<T>() {
    const assetsGtw = new AssetsGatewayClient()
    return assetsGtw.explorer.getDefaultUserDrive$().pipe(
        raiseHTTPErrors(),
        map((resp: DefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            return new Shell<T>({ homeFolderId: resp.homeFolderId, assetsGtw })
        }),
    )
}

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
                    .upload$(
                        filename,
                        new Blob([arraybuffer]),
                        shell.homeFolderId,
                    )
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAssetAttributes(resp)
                            const data = cb(shell, resp)
                            return new Shell({
                                ...shell,
                                data,
                            })
                        }),
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
                const { libraryId, version } = input(shell)
                return shell.assetsGtw.cdn
                    .downloadLibrary(libraryId, version)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expect(resp).toBeInstanceOf(Blob)
                            const data = cb(shell, resp)
                            return new Shell({
                                ...shell,
                                data,
                            })
                        }),
                    )
            }),
        )
    }
}

export function getInfo<T>(
    input: (shell: Shell<T>) => { libraryId: string },
    cb: (shell: Shell<T>, resp) => T,
    onError: OperatorFunction<
        LibraryInfoResponse | HTTPError,
        LibraryInfoResponse | ManagedError
    > = raiseHTTPErrors(),
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { libraryId } = input(shell)
                return shell.assetsGtw.cdn.getLibraryInfo$(libraryId).pipe(
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
                        const data = cb(shell, resp)
                        return new Shell({
                            ...shell,
                            data,
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
                const { libraryId, version } = input(shell)
                return shell.assetsGtw.cdn
                    .getVersionInfo$(libraryId, version)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, [
                                'name',
                                'version',
                                'id',
                                'namespace',
                                'type',
                                'fingerprint',
                            ])
                            const data = cb(shell, resp)
                            return new Shell({
                                ...shell,
                                data,
                            })
                        }),
                    )
            }),
        )
    }
}

export function getPackageFolderContent<T>(
    input: (shell: Shell<T>) => {
        rawId: string
        path: string
        version: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { rawId, path, version } = input(shell)
                return shell.assetsGtw.cdn
                    .queryExplorer$(rawId, version, path)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, ['folders', 'files'])
                            const data = cb(shell, resp)
                            return new Shell({
                                ...shell,
                                data,
                            })
                        }),
                    )
            }),
        )
    }
}

export function mapToShell<T, T1>(
    shell,
    cb: (shell: Shell<T1>, resp) => T1,
): OperatorFunction<T, Shell<T1>> {
    return (obs$: Observable<T>) => {
        return obs$.pipe(
            map((resp) => {
                const data = cb(shell, resp)
                return new Shell({
                    ...shell,
                    data,
                })
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
                const { libraryId, version } = input(shell)
                return shell.assetsGtw.cdn
                    .getEntryPoint$(libraryId, version)
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function getResource<T>(
    input: (shell: Shell<T>) => {
        libraryId: string
        version: string
        path: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { libraryId, path, version } = input(shell)
                return shell.assetsGtw.cdn
                    .getResource$(libraryId, version, path)
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
                const { libraryId } = input(shell)
                return shell.assetsGtw.cdn.deleteLibrary$(libraryId).pipe(
                    raiseHTTPErrors(),
                    map((resp) => {
                        expectAttributes(resp, ['deletedVersionsCount'])
                        const data = cb(shell, resp)
                        return new Shell({
                            ...shell,
                            data,
                        })
                    }),
                )
            }),
        )
    }
}
