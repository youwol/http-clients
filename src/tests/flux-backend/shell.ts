import '../mock-requests'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { mergeMap, take, tap } from 'rxjs/operators'
import { forkJoin, Observable, OperatorFunction } from 'rxjs'

import {
    expectAssetAttributes,
    expectAttributes,
    ManagedError,
    mapToShell,
    Shell,
} from '../common'
import {
    DeleteProjectResponse,
    GetProjectResponse,
    NewProjectResponse,
    UpdateProjectBody,
} from '../../lib/flux-backend'
import { readFileSync } from 'fs'

export function newProject<T>(
    input: (shell: Shell<T>) => { folderId: string },
    cb: (shell: Shell<T>, resp: NewAssetResponse<NewProjectResponse>) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { folderId } = input(shell)
                return shell.assetsGtw.flux
                    .newProject$({
                        body: { name: 'flux-project' },
                        queryParameters: { folderId },
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

export function getProject<T>(
    input: (shell: Shell<T>) => { projectId: string },
    cb: (shell: Shell<T>, resp: GetProjectResponse) => T,
    onError: OperatorFunction<
        GetProjectResponse | HTTPError,
        GetProjectResponse | ManagedError
    > = raiseHTTPErrors(),
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { projectId } = input(shell)
                return shell.assetsGtw.flux.getProject$({ projectId }).pipe(
                    onError,
                    tap((resp) => {
                        if (resp == 'ManagedError') {
                            return shell
                        }
                        expectAttributes(resp, [
                            'schemaVersion',
                            'requirements',
                            'workflow',
                            'builderRendering',
                            'runnerRendering',
                        ])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
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
