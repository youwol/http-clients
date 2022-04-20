// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import { resetPyYouwolDbs$ } from '../common'
import '../mock-requests'
import { shell$ } from '../common'
import {
    deleteProject,
    downloadZip,
    getProject,
    newProject,
    updateMetadata,
    updateProject,
    upload,
    uploadPackages,
} from './shell'
import { GetProjectResponse } from '../../lib/flux-backend'
import { onHTTPErrors } from '../../lib'
import { tap } from 'rxjs/operators'
import path from 'path'
import { Subject } from 'rxjs'
import * as fs from 'fs'
jest.setTimeout(90 * 1000)
beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
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
            newProject(
                (shell) => ({ folderId: shell.homeFolderId }),
                (shell, resp) => {
                    return new Context({
                        ...shell.context,
                        projectId: resp.rawId,
                    })
                },
            ),
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell, resp) => {
                    expect(resp.workflow.modules).toHaveLength(1)
                    return new Context({ ...shell.context, project: resp })
                },
            ),
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
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell, resp) => {
                    expect(resp.workflow.modules).toHaveLength(2)
                    return shell.context
                },
            ),
            deleteProject((shell) => ({ projectId: shell.context.projectId })),
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell) => {
                    return shell.context
                },
                onHTTPErrors((resp) => {
                    expect(resp.status).toBe(404)
                    return 'ManagedError'
                }),
            ),
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
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell, resp) => {
                    expect(resp.workflow.modules).toHaveLength(5)
                    return new Context({ ...shell.context, project: resp })
                },
            ),
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
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell) => {
                    return shell.context
                },
                onHTTPErrors((resp) => {
                    expect(resp.status).toBe(404)
                    return 'ManagedError'
                }),
            ),
            upload((shell) => ({
                zipFile: path.resolve(__dirname, './result.zip'),
                projectId: shell.context.projectId,
                folderId: shell.homeFolderId,
            })),
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell, resp) => {
                    expect(resp).toEqual(shell.context.project)
                    return shell.context
                },
            ),
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
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell, resp) => {
                    expect(resp.workflow.modules).toHaveLength(1)
                    return new Context({ ...shell.context, project: resp })
                },
            ),
            updateMetadata((shell) => ({
                projectId: shell.context.projectId,
                libraries: { a: '0.0.2' },
            })),
            getProject(
                (shell) => ({ projectId: shell.context.projectId }),
                (shell, resp) => {
                    // a2 has an additional dependency on b@0.0.1 (depending itself on root)
                    // => three layers for loading graph: root => b => a
                    expect(resp.workflow.modules).toHaveLength(1)
                    expect(resp.requirements.libraries.a).toBe('0.0.2')
                    expect(resp.requirements.libraries.b).toBe('0.0.1')
                    expect(
                        resp.requirements.loadingGraph.definition,
                    ).toHaveLength(3)
                    return shell.context
                },
            ),
        )
        .subscribe(() => done())
})
