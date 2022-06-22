import { Shell, shell$ } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import { setup$ } from './utils'
import { getProject, newProject } from '../flux-backend/shell'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { NewProjectResponse } from '../../lib/flux-backend'
import { uploadAsset, switchToRemoteShell } from './shell'
import { purgeDrive, queryChildren, trashItem } from '../treedb-backend/shell'
import { getAsset } from '../assets-backend/shell'
import { Observable } from 'rxjs'
import { CreateStoryResponse } from '../../lib/stories-backend'
import { createStory, getStory } from '../stories-backend/shell.operators'
import { getInfo, upload } from '../files-backend/shell'
import path from 'path'
import { UploadResponse } from '../../lib/files-backend'

jest.setTimeout(10 * 1000)
beforeAll(async (done) => {
    setup$({
        localOnly: false,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

interface UploadContext {
    asset: NewAssetResponse<unknown>
}

function uploadTest<TContext extends UploadContext>({
    createOperator,
    getRawOperator,
}) {
    return (source$: Observable<Shell<TContext>>) => {
        return source$.pipe(
            createOperator,
            uploadAsset<TContext>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
            }),
            queryChildren<TContext>({
                inputs: (shell) => ({
                    parentId: shell.homeFolderId,
                }),
                sideEffects: (resp, shell) => {
                    const found = resp.items.find(
                        (item) => item.assetId == shell.context.asset.assetId,
                    )
                    expect(found).toBeTruthy()
                    expect(found['origin'].remote).toBeTruthy()
                    expect(found['origin'].local).toBeTruthy()
                },
            }),
            switchToRemoteShell(),
            getAsset({
                inputs: (shell) => {
                    return {
                        assetId: shell.context.asset.assetId,
                    }
                },
                sideEffects: (resp, shell) => {
                    expect(resp.name).toBe(shell.context.asset.name)
                },
            }),
            getRawOperator,
            trashItem({
                inputs: (shell) => ({ itemId: shell.context.asset.itemId }),
            }),
            queryChildren<TContext>({
                inputs: (shell) => ({
                    parentId: shell.homeFolderId,
                }),
                sideEffects: (resp, shell) => {
                    const found = resp.items.find(
                        (item) => item.assetId == shell.context.asset.assetId,
                    )
                    expect(found).toBeFalsy()
                },
            }),
            purgeDrive({
                inputs: (shell) => ({ driveId: shell.defaultDriveId }),
            }),
        )
    }
}

test('upload flux project', (done) => {
    class Context implements UploadContext {
        public readonly projectName =
            'test-upload-flux-project (auto-generated)'
        asset: NewAssetResponse<NewProjectResponse>

        constructor(
            params: { asset?: NewAssetResponse<NewProjectResponse> } = {},
        ) {
            Object.assign(this, params)
        }
    }
    shell$(new Context())
        .pipe(
            uploadTest({
                createOperator: newProject<Context>({
                    inputs: (shell) => ({
                        queryParameters: { folderId: shell.homeFolderId },
                        body: { name: shell.context.projectName },
                    }),
                    newContext: (
                        shell,
                        resp: NewAssetResponse<NewProjectResponse>,
                    ) => {
                        return new Context({
                            ...shell.context,
                            asset: resp,
                        })
                    },
                }),
                getRawOperator: getProject<Context>({
                    inputs: (shell) => {
                        return {
                            projectId: shell.context.asset.rawId,
                        }
                    },
                    sideEffects: (resp) => {
                        expect(resp).toBeTruthy()
                    },
                }),
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('upload story', (done) => {
    class Context implements UploadContext {
        public readonly storyName = 'test-upload-story (auto-generated)'
        asset: NewAssetResponse<CreateStoryResponse>

        constructor(
            params: { asset?: NewAssetResponse<CreateStoryResponse> } = {},
        ) {
            Object.assign(this, params)
        }
    }
    shell$(new Context())
        .pipe(
            uploadTest({
                createOperator: createStory<Context>({
                    inputs: (shell) => ({
                        queryParameters: { folderId: shell.homeFolderId },
                        body: { title: shell.context.storyName },
                    }),
                    newContext: (
                        shell,
                        resp: NewAssetResponse<CreateStoryResponse>,
                    ) => {
                        return new Context({
                            ...shell.context,
                            asset: resp,
                        })
                    },
                }),
                getRawOperator: getStory<Context>({
                    inputs: (shell) => {
                        return {
                            storyId: shell.context.asset.rawId,
                        }
                    },
                    sideEffects: (resp) => {
                        expect(resp).toBeTruthy()
                    },
                }),
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('upload data', (done) => {
    class Context implements UploadContext {
        public readonly fileName = 'package.json'
        public readonly folder = __dirname + '/../files-backend/test-data'
        public readonly targetName = 'test-upload-data (auto-generated)'
        public readonly asset: NewAssetResponse<UploadResponse>

        constructor(params: { asset?: NewAssetResponse<UploadResponse> } = {}) {
            Object.assign(this, params)
        }
    }

    shell$(new Context())
        .pipe(
            uploadTest<Context>({
                createOperator: upload<Context>({
                    inputs: (shell) => {
                        return {
                            body: {
                                fileName: shell.context.targetName,
                                path: path.resolve(
                                    shell.context.folder,
                                    shell.context.fileName,
                                ),
                            },
                            queryParameters: { folderId: shell.homeFolderId },
                        }
                    },
                    newContext: (
                        shell,
                        resp: NewAssetResponse<UploadResponse>,
                    ) => {
                        return new Context({
                            ...shell.context,
                            asset: resp,
                        })
                    },
                }),
                getRawOperator: getInfo<Context>({
                    inputs: (shell) => {
                        return {
                            fileId: shell.context.asset.rawId,
                        }
                    },
                    sideEffects: (resp) => {
                        expect(resp).toBeTruthy()
                    },
                }),
            }),
        )
        .subscribe(() => {
            done()
        })
})
