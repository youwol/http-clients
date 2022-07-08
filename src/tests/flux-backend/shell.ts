import '../mock-requests'
import { CallerRequestOptions, HTTPError, raiseHTTPErrors } from '../../lib'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { mergeMap, take, tap } from 'rxjs/operators'
import { forkJoin, Observable } from 'rxjs'

import {
    expectAssetAttributes,
    expectAttributes,
    mapToShell,
    newShellFromContext,
    Shell,
    wrap,
} from '../common'
import {
    DeleteProjectResponse,
    GetProjectResponse,
    NewProjectBody,
    NewProjectResponse,
    PublishApplicationBody,
    UpdateProjectBody,
} from '../../lib/flux-backend'
import { readFileSync } from 'fs'
import { UploadResponse as CdnUploadResponse } from '../../lib/cdn-backend'

export function newProject<TContext>({
    inputs,
    sideEffects,
    authorizedErrors,
    newContext,
}: {
    inputs: (shell: Shell<TContext>) => {
        body: NewProjectBody
        queryParameters: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: NewProjectResponse | NewAssetResponse<NewProjectResponse>,
    ) => TContext
}) {
    return wrap<
        Shell<TContext>,
        NewProjectResponse | NewAssetResponse<NewProjectResponse>,
        TContext
    >({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.flux.newProject$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getProject<TContext>({
    inputs,
    sideEffects,
    authorizedErrors,
    newContext,
}: {
    inputs: (shell: Shell<TContext>) => {
        projectId: string
        callerOptions?: CallerRequestOptions
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: GetProjectResponse) => TContext
}) {
    return wrap<Shell<TContext>, GetProjectResponse, TContext>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.flux.getProject$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAttributes(resp, [
                'schemaVersion',
                'requirements',
                'workflow',
                'builderRendering',
                'runnerRendering',
            ])
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function updateProject<T>(
    input: (shell: Shell<T>) => { projectId: string; body: UpdateProjectBody },
    cb?: (shell: Shell<T>, resp: GetProjectResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { projectId, body } = input(shell)
                return shell.assetsGtw.flux
                    .updateProject$({ projectId, body })
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function deleteProject<T>(
    input: (shell: Shell<T>) => { projectId: string },
    cb?: (shell: Shell<T>, resp: DeleteProjectResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { projectId } = input(shell)
                return shell.assetsGtw.flux.deleteProject$({ projectId }).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['status', 'projectId'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function upload<T>(
    input: (shell: Shell<T>) => {
        zipFile: string
        projectId: string
        folderId: string
    },
    cb?: (shell: Shell<T>, resp: NewAssetResponse<NewProjectResponse>) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { zipFile, projectId, folderId } = input(shell)
                const buffer = readFileSync(zipFile)
                const blob = new Blob([Uint8Array.from(buffer).buffer])
                return shell.assetsGtw.flux
                    .upload$({
                        body: { content: blob },
                        queryParameters: { projectId, folderId },
                    })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp: NewAssetResponse<NewProjectResponse>) => {
                            expectAssetAttributes(resp)
                            expectAttributes(resp.rawResponse, [
                                'libraries',
                                'projectId',
                            ])
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function downloadZip<T>(
    input: (shell: Shell<T>) => {
        projectId: string
    },
    cb: (shell: Shell<T>, resp: Blob) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { projectId } = input(shell)
                return shell.assetsGtw.flux.downloadZip$({ projectId }).pipe(
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

export function uploadPackages<T>(
    input: (shell: Shell<T>) => {
        filePaths: string[]
    },
    cb?: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return forkJoin(
                    input(shell).filePaths.map((path) => {
                        const buffer = readFileSync(path)
                        const filename = path.split('/').slice(-1)[0]
                        const arraybuffer = Uint8Array.from(buffer).buffer
                        return shell.assetsGtw.cdn
                            .upload$({
                                body: {
                                    fileName: filename,
                                    blob: new Blob([arraybuffer]),
                                },
                                queryParameters: {
                                    folderId: shell.homeFolderId,
                                },
                            })
                            .pipe(take(1))
                    }),
                ).pipe(mapToShell(shell, cb))
            }),
        )
    }
}

export function updateMetadata<T>(
    input: (shell: Shell<T>) => {
        projectId: string
        libraries: { [k: string]: string }
    },
    cb?: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { libraries, projectId } = input(shell)
                return shell.assetsGtw.flux
                    .updateMetadata$({ projectId, body: { libraries } })
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function duplicate<T>(
    input: (shell: Shell<T>) => {
        projectId: string
        folderId: string
    },
    cb?: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { projectId, folderId } = input(shell)
                return shell.assetsGtw.flux
                    .duplicate$({ projectId, queryParameters: { folderId } })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expect(resp).toBeTruthy()
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function publishProject<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        projectId: string
        body: PublishApplicationBody
        queryParameters?: { folderId?: string }
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: NewAssetResponse<CdnUploadResponse>,
    ) => TContext
}) {
    return wrap<
        Shell<TContext>,
        NewAssetResponse<CdnUploadResponse> | CdnUploadResponse,
        TContext
    >({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.flux.publishApplication$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp: NewAssetResponse<CdnUploadResponse>, shell) => {
            expectAssetAttributes(resp)
            expectAttributes(resp.rawResponse, [
                'name',
                'id',
                'version',
                'fingerprint',
                'compressedSize',
            ])
            expect(resp.kind).toBe('package')
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}
