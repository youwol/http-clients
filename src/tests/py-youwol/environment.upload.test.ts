import { shell$ } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import { setup$ } from './utils'
import { getProject, newProject } from '../flux-backend/shell'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { NewProjectResponse } from '../../lib/flux-backend'
import { uploadAsset, switchToRemoteShell } from './shell'
import { purgeDrive, queryChildren, trashItem } from '../treedb-backend/shell'
import { getAsset } from '../assets-backend/shell'

jest.setTimeout(10 * 1000)
beforeAll(async (done) => {
    setup$({
        localOnly: false,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('upload flux project', (done) => {
    class Context {
        public readonly projectName =
            'test-upload-flux-project (auto-generated)'
        asset: NewAssetResponse<NewProjectResponse>
        projectId: string
        assetId: string
        constructor(
            params: { asset?: NewAssetResponse<NewProjectResponse> } = {},
        ) {
            Object.assign(this, params)
        }
    }
    shell$(new Context())
        .pipe(
            newProject({
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
            uploadAsset({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
            }),
            queryChildren<Context>({
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
                    expect(resp.name).toBe(shell.context.projectName)
                },
            }),
            getProject({
                inputs: (shell) => {
                    return {
                        projectId: shell.context.asset.rawId,
                    }
                },
                sideEffects: (resp) => {
                    expect(resp).toBeTruthy()
                },
            }),
            trashItem({
                inputs: (shell) => ({ itemId: shell.context.asset.itemId }),
            }),
            queryChildren<Context>({
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
        .subscribe(() => {
            done()
        })
})
