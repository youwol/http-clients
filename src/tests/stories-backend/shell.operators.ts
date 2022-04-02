import { Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import { expectAssetAttributes, expectAttributes } from '../common'
import { Shell } from '../cdn-backend/shell'
import { PostGlobalContentBody } from '../../lib/stories-backend'

export function createStory<T>(
    storyId: string,
    title: string,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.assets.story
                    .create$(shell.homeFolderId, {
                        title,
                        storyId,
                    })
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

export function getStory<T>(storyId: string, cb: (shell: Shell<T>, resp) => T) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.assetsGtw.stories.getStory$(storyId).pipe(
                    raiseHTTPErrors(),
                    map((resp) => {
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
