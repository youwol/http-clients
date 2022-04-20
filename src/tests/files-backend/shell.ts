import '../mock-requests'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { map, mergeMap, tap } from 'rxjs/operators'
import { Observable, OperatorFunction } from 'rxjs'
import { readFileSync } from 'fs'
import {
    expectAssetAttributes,
    expectAttributes,
    ManagedError,
    mapToShell,
    Shell,
} from '../common'
import {
    PostFileResponse,
    PostMetadataBody,
    RemoveResponse,
    GetInfoResponse,
} from '../../lib/files-backend'

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
                const blob = new Blob([Uint8Array.from(buffer).buffer])
                return shell.assetsGtw.files
                    .upload$({
                        body: { fileId, fileName, content: blob },
                        queryParameters: { folderId: shell.homeFolderId },
                    })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp: NewAssetResponse<PostFileResponse>) => {
                            expectAssetAttributes(resp)
                            expectAttributes(resp.rawResponse, [
                                'fileId',
                                'fileName',
                                'contentType',
                                'contentEncoding',
                            ])
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function getInfo<T>(
    input: (shell: Shell<T>) => { fileId: string },
    cb: (shell: Shell<T>, resp: GetInfoResponse) => T,
    onError: OperatorFunction<
        GetInfoResponse | HTTPError,
        GetInfoResponse | ManagedError
    > = raiseHTTPErrors(),
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { fileId } = input(shell)
                return shell.assetsGtw.files.getInfo$({ fileId }).pipe(
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
                        const context = cb(shell, resp)
                        return new Shell({
                            ...shell,
                            context,
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
                    .updateMetadata$({ fileId, body: metadata })
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
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
                return shell.assetsGtw.files.get$({ fileId }).pipe(
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

export function remove<T>(
    input: (shell: Shell<T>) => { fileId: string },
    cb: (shell: Shell<T>, resp: RemoveResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { fileId } = input(shell)
                return shell.assetsGtw.files
                    .remove$({ fileId })
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}
