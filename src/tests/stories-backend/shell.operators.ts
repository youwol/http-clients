import { forkJoin, Observable } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import {
    expectAssetAttributes,
    expectAttributes,
    mapToShell,
    newShellFromContext,
    Shell,
    wrap,
} from '../common'
import {
    AddPluginBody,
    DeleteDocumentResponse,
    DeleteStoryResponse,
    DocumentContentBody,
    GetDocumentResponse,
    QueryDocumentsResponse,
    MoveDocumentBody,
    UpdateGlobalContentBody,
    AddPluginResponse,
    UpdateDocumentBody,
    CreateStoryResponse,
    GetStoryResponse,
    CreateBody,
} from '../../lib/stories-backend'
import { NewAssetResponse } from '../../lib/assets-gateway'

export function healthz<T>() {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories.getHealthz$().pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expect(resp.status).toBe('stories-backend serving')
                    }),
                    mapToShell(shell),
                )
            }),
        )
    }
}

export function createStory<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        body: CreateBody
        queryParameters?: { folderId?: string }
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (
        shell: Shell<TContext>,
        resp: CreateStoryResponse | NewAssetResponse<CreateStoryResponse>,
    ) => TContext
}) {
    return wrap<
        Shell<TContext>,
        CreateStoryResponse | NewAssetResponse<CreateStoryResponse>,
        TContext
    >({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.stories.create$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAssetAttributes(resp)
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getStory<TContext>({
    inputs,
    authorizedErrors,
    newContext,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        storyId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: GetStoryResponse) => TContext
}) {
    return wrap<Shell<TContext>, GetStoryResponse, TContext>({
        observable: (shell: Shell<TContext>) =>
            shell.assetsGtw.stories.getStory$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expectAttributes(resp, [
                'storyId',
                'rootDocumentId',
                'title',
                'authors',
            ])
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function getGlobalContents<T>(
    storyId: string,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories
                    .getGlobalContents$({ storyId })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expectAttributes(resp, [
                                'css',
                                'javascript',
                                'components',
                            ])
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function updateGlobalContents<T>(
    storyId: string,
    content: UpdateGlobalContentBody,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories
                    .updateGlobalContents$({ storyId, body: content })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expectAttributes(resp, [])
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function getContent<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        documentId: string
    },
    cb: (shell: Shell<T>, resp: DocumentContentBody) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories.getContent$(args).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, [
                            'html',
                            'css',
                            'components',
                            'styles',
                        ])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function updateContent<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        documentId: string
        body: DocumentContentBody
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories
                    .updateContent$(args)
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function updateDocument<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        documentId: string
        body: UpdateDocumentBody
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories.updateDocument$(args).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, [
                            'documentId',
                            'title',
                            'position',
                            'storyId',
                            'contentId',
                            'parentDocumentId',
                        ])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function deleteDocument<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        documentId: string
    },
    cb: (shell: Shell<T>, resp: DeleteDocumentResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories.deleteDocument$(args).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['deletedDocuments'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function addPlugin<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        body: AddPluginBody
        headers: { [k: string]: string }
    },
    cb: (shell: Shell<T>, resp: AddPluginResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories
                    .addPlugin$({
                        ...args,
                        callerOptions: {
                            headers: args.headers,
                        },
                    })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expectAttributes(resp, [
                                'packageName',
                                'version',
                                'requirements',
                            ])
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function addDocuments<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        parentDocumentId: string
        titles: string[]
        contents?: { [k: string]: DocumentContentBody }
    },
    cb: (shell: Shell<T>, resp: GetDocumentResponse[]) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return forkJoin(
                    args.titles.map((title) =>
                        shell.assetsGtw.stories
                            .createDocument$({
                                storyId: args.storyId,
                                body: {
                                    parentDocumentId: args.parentDocumentId,
                                    title,
                                    content:
                                        args.contents && args.contents[title]
                                            ? args.contents[title]
                                            : undefined,
                                },
                            })
                            .pipe(raiseHTTPErrors()),
                    ),
                ).pipe(
                    tap((resp) => {
                        expect(resp).toBeInstanceOf(Array)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function queryDocuments<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        parentDocumentId: string
        fromIndex: number
        count: number
    },
    cb: (shell: Shell<T>, resp: QueryDocumentsResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories.queryDocuments$(args).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expectAttributes(resp, ['documents'])
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}

export function moveDocument<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        documentId: string
        destination: MoveDocumentBody
    },
    cb: (shell: Shell<T>, resp: null) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories
                    .moveDocument$({ ...args, body: args.destination })
                    .pipe(
                        raiseHTTPErrors(),
                        tap((resp) => {
                            expectAttributes(resp, [])
                        }),
                        mapToShell(shell, cb),
                    )
            }),
        )
    }
}

export function publish<T>(
    input: (shell: Shell<T>) => {
        folderId: string
        filename: string
        blob: Blob
    },
    cb: (shell: Shell<T>, resp: null) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories
                    .publish$({
                        body: { fileName: args.filename, blob: args.blob },
                        queryParameters: { folderId: args.folderId },
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

export function downloadZip<T>(
    input: (shell: Shell<T>) => {
        storyId: string
    },
    cb: (shell: Shell<T>, resp: Blob) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories.downloadZip$(args).pipe(
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

export function deleteStory<T>(
    input: (shell: Shell<T>) => {
        storyId: string
    },
    cb: (shell: Shell<T>, resp: DeleteStoryResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories.deleteStory$(args).pipe(
                    raiseHTTPErrors(),
                    tap((resp) => {
                        expect(resp).toEqual(null)
                    }),
                    mapToShell(shell, cb),
                )
            }),
        )
    }
}
