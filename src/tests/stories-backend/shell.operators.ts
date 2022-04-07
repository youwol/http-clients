import { forkJoin, Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import { expectAssetAttributes, expectAttributes } from '../common'
import { Shell } from '../cdn-backend/shell'
import {
    AddPluginBody,
    DeleteDocumentResponse,
    DeleteStoryResponse,
    DocumentContentBody,
    DocumentResponse,
    DocumentsResponse,
    MoveDocumentBody,
    PostGlobalContentBody,
    PostPluginResponse,
    UpdateDocumentBody,
} from '../../lib/stories-backend'

export function createStory<T>(
    storyId: string,
    title: string,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories
                    .create$(
                        {
                            title,
                            storyId,
                        },
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

export function getStory<T>(
    storyId: string,
    cb: (shell: Shell<T>, resp) => T,
    onError = raiseHTTPErrors(),
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories.getStory$(storyId).pipe(
                    onError,
                    map((resp) => {
                        if (resp == 'ErrorManaged') return shell
                        expectAttributes(resp, [
                            'storyId',
                            'rootDocumentId',
                            'title',
                            'authors',
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

export function getGlobalContents<T>(
    storyId: string,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories.getGlobalContents$(storyId).pipe(
                    raiseHTTPErrors(),
                    map((resp) => {
                        expectAttributes(resp, [
                            'css',
                            'javascript',
                            'components',
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

export function updateGlobalContents<T>(
    storyId: string,
    content: PostGlobalContentBody,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories
                    .updateGlobalContents$(storyId, content)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, [])
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
                return shell.assetsGtw.stories
                    .getContent$(args.storyId, args.documentId)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, [
                                'html',
                                'css',
                                'components',
                                'styles',
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
                    .updateContent$(args.storyId, args.documentId, args.body)
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
                return shell.assetsGtw.stories
                    .updateDocument$(args.storyId, args.documentId, args.body)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, [
                                'documentId',
                                'title',
                                'position',
                                'storyId',
                                'contentId',
                                'parentDocumentId',
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
                return shell.assetsGtw.stories
                    .deleteDocument$(args.storyId, args.documentId)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, ['deletedDocuments'])
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

export function addPlugin<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        body: AddPluginBody
        headers: { [k: string]: string }
    },
    cb: (shell: Shell<T>, resp: PostPluginResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories
                    .addPlugin$(args.storyId, args.body, {
                        headers: args.headers,
                    })
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, [
                                'packageName',
                                'version',
                                'requirements',
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

export function addDocuments<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        parentDocumentId: string
        titles: string[]
        contents?: { [k: string]: DocumentContentBody }
    },
    cb: (shell: Shell<T>, resp: DocumentResponse[]) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return forkJoin(
                    args.titles.map((title) =>
                        shell.assetsGtw.stories
                            .createDocument$(args.storyId, {
                                parentDocumentId: args.parentDocumentId,
                                title,
                                content:
                                    args.contents && args.contents[title]
                                        ? args.contents[title]
                                        : undefined,
                            })
                            .pipe(raiseHTTPErrors()),
                    ),
                ).pipe(
                    map((resp) => {
                        expect(resp).toBeInstanceOf(Array)
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

export function queryDocuments<T>(
    input: (shell: Shell<T>) => {
        storyId: string
        parentDocumentId: string
        fromIndex: number
        count: number
    },
    cb: (shell: Shell<T>, resp: DocumentsResponse) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const args = input(shell)
                return shell.assetsGtw.stories
                    .queryDocuments$(
                        args.storyId,
                        args.parentDocumentId,
                        args.fromIndex,
                        args.count,
                    )
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, ['documents'])
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
                    .moveDocument$(
                        args.storyId,
                        args.documentId,
                        args.destination,
                    )
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, [])
                            const data = cb(shell, resp as null)
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
                    .publish$(args.filename, args.blob, args.folderId)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAssetAttributes(resp)
                            const data = cb(shell, resp as null)
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
                return shell.assetsGtw.stories.downloadZip$(args.storyId).pipe(
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
                return shell.assetsGtw.stories.deleteStory$(args.storyId).pipe(
                    raiseHTTPErrors(),
                    map((resp) => {
                        expect(resp).toEqual(null)
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
