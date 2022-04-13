import '../mock-requests'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import {
    AssetsGatewayClient,
    DefaultDriveResponse,
    NewAssetResponse,
} from '../../lib/assets-gateway'
import { map, mergeMap } from 'rxjs/operators'
import { Observable, OperatorFunction } from 'rxjs'
import { readFileSync } from 'fs'
import { expectAssetAttributes, expectAttributes } from '../common'
import {
    PostFileResponse,
    PostMetadataBody,
    RemoveResponse,
    StatsResponse,
} from '../../lib/files-backend'

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

export function shell$<T>(data?: any) {
    const assetsGtw = new AssetsGatewayClient()
    return assetsGtw.explorer.getDefaultUserDrive$().pipe(
        raiseHTTPErrors(),
        map((resp: DefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            return new Shell<T>({
                homeFolderId: resp.homeFolderId,
                assetsGtw,
                data,
            })
        }),
    )
}

export function upload<T>(
    input: (shell: Shell<T>) => {
        fileId: string
        fileName: string
        path: string
    },
    cb: (shell: Shell<T>, resp: NewAssetResponse<PostFileResponse>) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { fileId, fileName, path } = input(shell)
                const buffer = readFileSync(path)
                const arraybuffer = Uint8Array.from(buffer).buffer
                return shell.assetsGtw.files
                    .upload$(
                        {
                            fileName,
                            blob: new Blob([arraybuffer]),
                            fileId,
                        },
                        shell.homeFolderId,
                    )
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp: NewAssetResponse<PostFileResponse>) => {
                            expectAssetAttributes(resp)
                            expectAttributes(resp.rawResponse, [
                                'fileId',
                                'fileName',
                                'contentType',
                                'contentEncoding',
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

export function getStats<T>(
    input: (shell: Shell<T>) => { fileId: string },
    cb: (shell: Shell<T>, resp: StatsResponse) => T,
    onError: OperatorFunction<
        StatsResponse | HTTPError,
        StatsResponse | ManagedError
    > = raiseHTTPErrors(),
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { fileId } = input(shell)
                return shell.assetsGtw.files.getStats$(fileId).pipe(
                    onError,
                    map((resp) => {
                        if (resp == 'ManagedError') {
                            return shell
                        }
                        expectAttributes(resp, ['metadata'])
                        expectAttributes(resp.metadata, [
                            'contentType',
                            'contentEncoding',
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

export function updateMetadata<T>(
    input: (shell: Shell<T>) => { fileId: string; metadata: PostMetadataBody },
    cb: (shell: Shell<T>, resp: PostMetadataBody) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { fileId, metadata } = input(shell)
                return shell.assetsGtw.files
                    .updateMetadata$(fileId, metadata)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
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

export function get<T>(
    input: (shell: Shell<T>) => { fileId: string },
    cb: (shell: Shell<T>, resp: Blob) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { fileId } = input(shell)
                return shell.assetsGtw.files.get$(fileId).pipe(
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

export function remove<T>(
    input: (shell: Shell<T>) => { fileId: string },
    cb: (shell: Shell<T>, resp: RemoveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { fileId } = input(shell)
                return shell.assetsGtw.files.remove$(fileId).pipe(
                    raiseHTTPErrors(),
                    map((resp) => {
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
