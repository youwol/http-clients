// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import '../mock-requests'
import { shell$ } from '../common'
import {
    deleteProject,
    downloadZip,
    duplicate,
    getProject,
    newProject,
    updateMetadata,
    updateProject,
    upload,
    uploadPackages,
} from './shell'
import { GetProjectResponse, NewProjectResponse } from '../../lib/flux-backend'
import { tap } from 'rxjs/operators'
import path from 'path'
import { Subject } from 'rxjs'
import * as fs from 'fs'
import { setup$ } from '../py-youwol/utils'
import { purgeDrive, trashItem } from '../treedb-backend/shell'
import { getAsset } from '../assets-backend/shell'
import { NewAssetResponse } from '../../lib/assets-gateway'

beforeAll(async (done) => {
    setup$({
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('new project, update project, delete', (done) => {
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
    shell$<Context>()
        .pipe(
            newProject({
                inputs: (shell) => ({
                    queryParameters: { folderId: shell.homeFolderId },
                    body: { name: 'flux-project' },
                }),
                newContext: (
                    shell,
                    resp: NewAssetResponse<NewProjectResponse>,
                ) => {
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
        .subscribe(() => {
            done()
        })
})

test('new project, delete from explorer (purge)', (done) => {
    class Context {
        itemId: string
        projectId: string
        assetId: string
        constructor(params: { itemId?: string; projectId?: string }) {
            Object.assign(this, params)
        }
    }
    shell$<Context>()
        .pipe(
            newProject({
                inputs: (shell) => ({
                    queryParameters: { folderId: shell.homeFolderId },
                    body: { name: 'flux-project' },
                }),
                newContext: (
                    shell,
                    resp: NewAssetResponse<NewProjectResponse>,
                ) => {
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
        .subscribe(() => {
            done()
        })
})

test('upload/download project', (done) => {
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
    shell$(new Context({}))
        .pipe(
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
        .subscribe(() => {
            done()
        })
})

test('update metadata', (done) => {
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

    shell$(new Context({}))
        .pipe(
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
                    expect(
                        resp.requirements.loadingGraph.definition,
                    ).toHaveLength(3)
                },
            }),
        )
        .subscribe(() => done())
})

test('duplicate project', (done) => {
    const testDataDir = __dirname + '/test-data'

    class Context {
        projectId = 'test-project-id'
        duplicatedId = ''
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

    shell$(new Context({}))
        .pipe(
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
        .subscribe(() => done())
})
