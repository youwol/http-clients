import '../mock-requests'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { mergeMap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { PathOrFileDescriptor, readFileSync } from 'fs'
import {
    expectAssetAttributes,
    expectAttributes,
    mapToShell,
    newShellFromContext,
    Shell,
    wrap,
} from '../common'
import {
    UploadResponse,
    UpdateMetadataBody,
    RemoveResponse,
    GetInfoResponse,
} from '../../lib/files-backend'

export function upload<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
    fileReaderSync,
}: {
    inputs: (shell: Shell<TContext>) => {
        body: {
            fileId?: string
            fileName: string
            path: string
        }
        queryParameters: { folderId: string }
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: NewAssetResponse<UploadResponse> | UploadResponse,
    ) => TContext
    fileReaderSync?: (
        path: PathOrFileDescriptor,
        options?: {
            encoding?: null
            flag?: string
        } | null,
    ) => Buffer
}) {
    const fileReader = fileReaderSync || readFileSync
    return wrap<
        Shell<TContext>,
        NewAssetResponse<UploadResponse> | UploadResponse,
        TContext
    >({
        observable: (shell: Shell<TContext>) => {
            const buffer = fileReader(inputs(shell).body.path)
            const blob = new Blob([Uint8Array.from(buffer).buffer])
            return shell.assetsGtw.files.upload$({
                body: { ...inputs(shell).body, content: blob },
                queryParameters: inputs(shell).queryParameters,
            })
        },
        authorizedErrors,
        sideEffects: (resp: NewAssetResponse<UploadResponse>, shell) => {
            expectAssetAttributes(resp)
            expectAttributes(resp.rawResponse, [
                'fileId',
                'fileName',
                'contentType',
                'contentEncoding',
            ])
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getInfo<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        fileId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: GetInfoResponse) => TContext
}) {
    return wrap<Shell<TContext>, GetInfoResponse, TContext>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.files.getInfo$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp: GetInfoResponse, shell) => {
            expectAttributes(resp, ['metadata'])
            expectAttributes(resp.metadata, ['contentType', 'contentEncoding'])
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function updateMetadata<T>(
    input: (shell: Shell<T>) => {
        fileId: string
        metadata: UpdateMetadataBody
    },
    cb: (shell: Shell<T>, resp: UpdateMetadataBody) => T,
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

export function get<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        fileId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: Blob) => TContext
}) {
    return wrap<Shell<TContext>, Blob, TContext>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.files.get$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expect(resp).toBeInstanceOf(Blob)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
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
