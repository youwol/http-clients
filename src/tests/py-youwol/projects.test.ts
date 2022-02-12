/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'
import { expand, map, mapTo, mergeMap, reduce, take, tap } from 'rxjs/operators'
import { combineLatest, Observable, of } from 'rxjs'
import { btoa } from 'buffer'
import {
    expectBuildStep,
    expectFlowStatus,
    expectInitStep,
    expectProjectsStatus,
    expectProjectStatus,
    expectPublishLocal,
    expectPublishRemote,
    uniqueProjectName,
} from './utils'
import { PipelineStepStatusResponse } from '../../lib/py-youwol/routers/projects/interfaces'

const pyYouwol = new PyYouwolClient()

let projectName: string

beforeAll(async (done) => {
    const youwolClient = new PyYouwolClient()
    projectName = uniqueProjectName('todo-app-js')
    resetPyYouwolDbs$()
        .pipe(
            mergeMap(() =>
                youwolClient.admin.customCommands.doPost$('clone-project', {
                    url: 'https://github.com/youwol/todo-app-js.git',
                    name: projectName,
                }),
            ),
            mergeMap(() => {
                return youwolClient.admin.customCommands.doDelete$(
                    'purge-downloads',
                )
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('pyYouwol.admin.projects.status', (done) => {
    combineLatest([
        pyYouwol.admin.projects.status$().pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.status$(),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expectProjectsStatus(respHttp, projectName)
            expectProjectsStatus(respWs.data, projectName)
            // respWs contains more fields than respHttp...e.g. pipeline.target (related to pb with union?)
            // expect(respHttp).toEqual(respWs.data)
            done()
        })
})

test('pyYouwol.admin.projects.projectStatus', (done) => {
    const projectId = btoa(projectName)

    combineLatest([
        pyYouwol.admin.projects
            .getProjectStatus$(projectId)
            .pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.projectStatus$({ projectId }),
    ]).subscribe(([respHttp, respWs]) => {
        expectProjectStatus(respHttp)
        expectAttributes(respWs.attributes, ['projectId'])
        expect(respWs.data).toEqual(respHttp)
        done()
    })
})

test('pyYouwol.admin.projects.flowStatus', (done) => {
    combineLatest([
        pyYouwol.admin.projects
            .flowStatus$(btoa(projectName), 'prod')
            .pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.pipelineStatus$(),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expectFlowStatus(respHttp, projectName)
            expectAttributes(respWs.attributes, ['projectId', 'flowId'])
            expect(respHttp).toEqual(respWs.data)
            done()
        })
})

function run$(stepId: string): Observable<PipelineStepStatusResponse> {
    return combineLatest([
        pyYouwol.admin.projects
            .runStep$(btoa(projectName), 'prod', stepId)
            .pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.stepStatus$().pipe(
            map((d) => d.data),
            take(4),
            reduce((acc, e) => [...acc, e], []),
        ),
    ]).pipe(map(([_, respWs]) => respWs.find((step) => step.stepId == stepId)))
}

test('pyYouwol.admin.projects.runStep', (done) => {
    const projectId = btoa(projectName)
    const data = [
        { step: 'init', expectTests: expectInitStep },
        { step: 'build', expectTests: expectBuildStep },
        { step: 'publish-local', expectTests: expectPublishLocal },
        { step: 'publish-remote', expectTests: expectPublishRemote },
    ]

    const ensureArtifacts$ = combineLatest([
        pyYouwol.admin.projects
            .getArtifacts$(projectId, 'prod')
            .pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.artifacts$({ projectId }),
    ]).pipe(
        tap(([respHttp, respWs]) => {
            expectAttributes(respHttp, ['artifacts'])
            expect(respHttp.artifacts).toHaveLength(1)
            expect(respHttp.artifacts[0].id).toBe('dist')
            expectAttributes(respWs.attributes, ['projectId', 'flowId'])
            expect(respWs.data).toEqual(respHttp)
        }),
    )

    of(0)
        .pipe(
            expand((i) => {
                const { step, expectTests } = data[i]
                return run$(step).pipe(
                    tap((stepResp) => expectTests(stepResp)),
                    mapTo(i + 1),
                )
            }),
            take(4),
            reduce((acc, e) => [acc, e], []),
            mergeMap(() => {
                return ensureArtifacts$
            }),
        )
        .subscribe(() => {
            done()
        })
})
