import '../mock-requests'
import { shell$ } from '../common'
import {
    deleteProject,
    downloadZip,
    duplicate,
    getProject,
    newProject,
    publishProject,
    updateMetadata,
    updateProject,
    upload,
    uploadPackages,
} from './shell'
import { GetProjectResponse, NewProjectResponse } from '../../lib/flux-backend'
import { tap } from 'rxjs/operators'
import path from 'path'
import { firstValueFrom, Subject } from 'rxjs'
import * as fs from 'fs'
import { LocalYouwol } from '@youwol/http-primitives'
import { purgeDrive, trashItem } from '../treedb-backend'
import { getAsset } from '../assets-backend'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { getInfo } from '../cdn-backend'

import { UploadResponse as CdnUploadResponse } from '../../lib/cdn-backend'

beforeAll(async () => {
    await firstValueFrom(
        LocalYouwol.setup$({
            localOnly: true,
            authId: 'int_tests_yw-users@test-user',
        }),
    )
})

test('new project, update project, delete', async () => {
    class Context {
        projectId: string
        project: GetProjectResponse
        constructor(params: {
            projectId?: string
            project?: GetProjectResponse
        }) {
            Object.assign(this, params)
        }
    }
    const test$ = shell$<Context>().pipe(
        newProject({
            inputs: (shell) => ({
                queryParameters: { folderId: shell.homeFolderId },
                body: { name: 'flux-project' },
            }),
            newContext: (shell, resp: NewAssetResponse<NewProjectResponse>) => {
                return new Context({
                    ...shell.context,
                    projectId: resp.rawId,
                })
            },
        }),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(1)
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, project: resp })
            },
        }),
        updateProject((shell) => {
            const workflow = shell.context.project.workflow
            const rootModule = workflow.modules[0]
            const newModule = { ...rootModule, moduleId: 'new-module' }
            const newWorkflow = {
                ...workflow,
                modules: [newModule, rootModule],
            }
            return {
                projectId: shell.context.projectId,
                body: {
                    ...shell.context.project,
                    workflow: newWorkflow,
                },
            }
        }),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(2)
            },
        }),
        deleteProject((shell) => ({ projectId: shell.context.projectId })),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            authorizedErrors: (resp) => {
                return resp.status == 404
            },
        }),
    )
    await firstValueFrom(test$)
})

test('new project, delete from explorer (purge)', async () => {
    class Context {
        itemId: string
        projectId: string
        assetId: string
        constructor(params: { itemId?: string; projectId?: string }) {
            Object.assign(this, params)
        }
    }
    const test$ = shell$<Context>().pipe(
        newProject({
            inputs: (shell) => ({
                queryParameters: { folderId: shell.homeFolderId },
                body: { name: 'flux-project' },
            }),
            newContext: (shell, resp: NewAssetResponse<NewProjectResponse>) => {
                return new Context({
                    ...shell.context,
                    itemId: resp.itemId,
                    projectId: resp.rawId,
                })
            },
        }),
        trashItem({
            inputs: (shell) => ({ itemId: shell.context.itemId }),
        }),
        purgeDrive({
            inputs: (shell) => ({ driveId: shell.defaultDriveId }),
        }),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            authorizedErrors: (resp) => {
                return resp.status == 404
            },
        }),
        getAsset({
            inputs: (shell) => ({ assetId: shell.context.projectId }),
            authorizedErrors: (resp) => {
                expect(resp.status).toBe(404)
                return true
            },
        }),
    )
    await firstValueFrom(test$)
})

test('upload/download project', async () => {
    const testDataDir = __dirname + '/test-data'
    class Context {
        projectId = 'test-project-id'
        zipFile = `${testDataDir}/project.zip`
        downloaded: Blob
        project: GetProjectResponse
        constructor(params: {
            downloaded?: Blob
            project?: GetProjectResponse
        }) {
            Object.assign(this, params)
        }
    }
    const test$ = shell$(new Context({})).pipe(
        upload((shell) => ({
            zipFile: shell.context.zipFile,
            projectId: shell.context.projectId,
            folderId: shell.homeFolderId,
        })),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(5)
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, project: resp })
            },
        }),
        downloadZip(
            (shell) => ({ projectId: shell.context.projectId }),
            (shell, resp) => {
                return new Context({ ...shell.context, downloaded: resp })
            },
        ),
        tap((shell) => {
            const fileReader = new FileReader()
            const subject = new Subject()
            fileReader.onload = function (event) {
                const downloaded = new Uint8Array(
                    event.target.result as ArrayBuffer,
                )
                fs.writeFileSync(
                    path.resolve(__dirname, './result.zip'),
                    downloaded,
                )
                subject.next(shell)
            }
            fileReader.readAsArrayBuffer(shell.context.downloaded)
            return
        }),
        deleteProject((shell) => ({ projectId: shell.context.projectId })),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            authorizedErrors: (resp) => resp.status == 404,
        }),
        upload((shell) => ({
            zipFile: path.resolve(__dirname, './result.zip'),
            projectId: shell.context.projectId,
            folderId: shell.homeFolderId,
        })),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp, shell) => {
                expect(resp).toEqual(shell.context.project)
            },
        }),
    )
    await firstValueFrom(test$)
})

test('update metadata', async () => {
    const testDataDir = __dirname + '/test-data'

    class Context {
        projectId = 'test-project-id'
        zipFile = `${testDataDir}/project-dependencies.zip`
        packages = [
            `root.zip`,
            `a_0.0.1.zip`,
            `a_0.0.2.zip`,
            `b_0.0.1.zip`,
        ].map((name) => `${testDataDir}/packages/${name}`)

        project: GetProjectResponse

        constructor(params: { project?: GetProjectResponse }) {
            Object.assign(this, params)
        }
    }

    const test$ = shell$(new Context({})).pipe(
        upload((shell) => ({
            zipFile: shell.context.zipFile,
            projectId: shell.context.projectId,
            folderId: shell.homeFolderId,
        })),
        uploadPackages((shell) => ({
            filePaths: shell.context.packages,
        })),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(1)
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, project: resp })
            },
        }),
        updateMetadata((shell) => ({
            projectId: shell.context.projectId,
            libraries: { a: '0.0.2' },
        })),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(1)
                expect(resp.requirements.libraries.a).toBe('0.0.2')
                expect(resp.requirements.libraries.b).toBe('0.0.1')
                expect(resp.requirements.loadingGraph.definition).toHaveLength(
                    3,
                )
            },
        }),
    )
    await firstValueFrom(test$)
})

test('duplicate project', async () => {
    const testDataDir = __dirname + '/test-data'

    class Context {
        projectId = 'test-project-id'
        zipFile = `${testDataDir}/project-dependencies.zip`
        packages = [
            `root.zip`,
            `a_0.0.1.zip`,
            `a_0.0.2.zip`,
            `b_0.0.1.zip`,
        ].map((name) => `${testDataDir}/packages/${name}`)

        project: GetProjectResponse

        constructor(params: {
            project?: GetProjectResponse
            duplicatedId?: string
        }) {
            Object.assign(this, params)
        }
    }

    const test$ = shell$(new Context({})).pipe(
        upload((shell) => ({
            zipFile: shell.context.zipFile,
            projectId: shell.context.projectId,
            folderId: shell.homeFolderId,
        })),
        uploadPackages((shell) => ({
            filePaths: shell.context.packages,
        })),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(1)
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, project: resp })
            },
        }),
        duplicate(
            (shell) => ({
                projectId: shell.context.projectId,
                folderId: shell.homeFolderId,
            }),
            (shell, resp) => {
                expect(resp.name).toBe('new flux-project (copy)')
                return new Context({
                    ...shell.context,
                    duplicatedId: resp.rawId,
                })
            },
        ),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(1)
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, project: resp })
            },
        }),
    )
    await firstValueFrom(test$)
})

test('new project, publish as application', async () => {
    class Context {
        projectId: string
        project: GetProjectResponse
        cdnAsset: NewAssetResponse<CdnUploadResponse>
        constructor(params: {
            projectId?: string
            project?: GetProjectResponse
            cdnAsset?: NewAssetResponse<CdnUploadResponse>
        }) {
            Object.assign(this, params)
        }
    }
    function getPublishBody(version: string) {
        return {
            name: 'my-app-test',
            displayName: 'Test application',
            version,
            execution: {
                standalone: true,
                parametrized: [],
            },
            graphics: {
                appIcon: { innerText: 'app icon' },
                fileIcon: { innerText: 'file icon' },
                background: { innerText: 'background' },
            },
        }
    }
    const test$ = shell$<Context>().pipe(
        newProject({
            inputs: (shell) => ({
                queryParameters: { folderId: shell.homeFolderId },
                body: { name: 'flux-project' },
            }),
            newContext: (shell, resp: NewAssetResponse<NewProjectResponse>) => {
                return new Context({
                    ...shell.context,
                    projectId: resp.rawId,
                })
            },
        }),
        getProject({
            inputs: (shell) => ({ projectId: shell.context.projectId }),
            sideEffects: (resp) => {
                expect(resp.workflow.modules).toHaveLength(1)
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, project: resp })
            },
        }),
        publishProject({
            inputs: (shell) => {
                return {
                    projectId: shell.context.projectId,
                    body: getPublishBody('0.0.1'),
                    queryParameters: {
                        folderId: shell.homeFolderId,
                    },
                }
            },
            sideEffects: (resp) => {
                expect(resp.name).toBe('my-app-test')
                expect(resp.rawResponse.name).toBe('my-app-test')
                expect(resp.rawResponse.version).toBe('0.0.1')
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, cdnAsset: resp })
            },
        }),
        getInfo(
            (shell) => {
                return { libraryId: shell.context.cdnAsset.rawId }
            },
            (shell, resp) => {
                expect(resp.versions).toEqual(['0.0.1'])
                return shell.context
            },
        ),
        publishProject({
            inputs: (shell) => {
                return {
                    projectId: shell.context.projectId,
                    body: getPublishBody('0.0.2'),
                    // we should not need to provide folderId as the asset has already been published
                    queryParameters: {
                        folderId: shell.homeFolderId,
                    },
                }
            },
            sideEffects: (resp) => {
                expect(resp.name).toBe('my-app-test')
                expect(resp.rawResponse.name).toBe('my-app-test')
                expect(resp.rawResponse.version).toBe('0.0.2')
            },
            newContext: (shell, resp) => {
                return new Context({ ...shell.context, cdnAsset: resp })
            },
        }),
        getInfo(
            (shell) => {
                return { libraryId: shell.context.cdnAsset.rawId }
            },
            (shell, resp) => {
                expect(resp.versions).toEqual(['0.0.2', '0.0.1'])
                return shell.context
            },
        ),
    )
    await firstValueFrom(test$)
})
