import { btoa } from 'buffer'
import { combineLatest, Observable, of } from 'rxjs'
import { expand, map, mapTo, mergeMap, reduce, take, tap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'
import { PipelineStepStatusResponse } from '../../lib/py-youwol'

import { expectAttributes } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import {
    expectArtifacts$,
    expectBuildStep,
    expectFlowStatus,
    expectInitStep,
    expectPipelineStepEvents$,
    expectProjectsStatus,
    expectProjectStatus,
    expectPublishLocal,
    expectPublishRemote,
    setup$,
    uniqueProjectName,
} from './utils'

const pyYouwol = new PyYouwolClient()

let projectName: string

beforeAll(async (done) => {
    projectName = uniqueProjectName('todo-app-js')
    setup$()
        .pipe(
            mergeMap(() =>
                pyYouwol.admin.customCommands.doPost$('clone-project', {
                    url: 'https://github.com/youwol/todo-app-js.git',
                    name: projectName,
                }),
            ),
            mergeMap(() => {
                return pyYouwol.admin.customCommands.doDelete$(
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
            .getProjectStatus$({ projectId })
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
            .getPipelineStatus$({
                projectId: btoa(projectName),
                flowId: 'prod',
            })
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

function run$(
    stepId: string,
    expectedCount: number,
): Observable<PipelineStepStatusResponse> {
    return combineLatest([
        pyYouwol.admin.projects
            .runStep$({ projectId: btoa(projectName), flowId: 'prod', stepId })
            .pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.stepStatus$().pipe(
            map((d) => d.data),
            take(expectedCount),
            reduce((acc, e) => [...acc, e], []),
        ),
    ]).pipe(map(([_, respWs]) => respWs.find((step) => step.stepId == stepId)))
}

test('pyYouwol.admin.projects.runStep', (done) => {
    const projectId = btoa(projectName)
    const data = [
        { step: 'init', expectTests: expectInitStep, expectedRefreshCount: 4 },
        {
            step: 'build',
            expectTests: expectBuildStep,
            expectedRefreshCount: 3,
        },
        {
            step: 'publish-local',
            expectTests: expectPublishLocal,
            expectedRefreshCount: 2,
        },
        {
            step: 'publish-remote',
            expectTests: expectPublishRemote,
            expectedRefreshCount: 1,
        },
    ]

    expectPipelineStepEvents$(pyYouwol).subscribe(() => {
        done()
    })

    of(0)
        .pipe(
            expand((i) => {
                const { step, expectTests, expectedRefreshCount } = data[i]
                return run$(step, expectedRefreshCount).pipe(
                    tap((stepResp) => expectTests(stepResp)),
                    mapTo(i + 1),
                )
            }),
            take(4),
            reduce((acc, e) => [acc, e], []),
            mergeMap(() => {
                return expectArtifacts$(pyYouwol, projectId)
            }),
        )
        .subscribe(() => {
            /* no op */
        })
})
/* eslint-enable jest/no-done-callback -- re-enable */
