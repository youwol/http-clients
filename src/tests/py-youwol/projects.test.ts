/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'
import { map, mergeMap, reduce, shareReplay, take } from 'rxjs/operators'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { btoa } from 'buffer'
import {
    expectBuildStep,
    expectInitStep,
    expectPublishLocal,
    uniqueProjectName,
} from './utils'

const pyYouwol = new PyYouwolClient()

let projectName: string

beforeAll(async (done) => {
    const youwolClient = new PyYouwolClient()
    projectName = uniqueProjectName('todo-app-js')
    resetPyYouwolDbs$()
        .pipe(
            mergeMap(() =>
                youwolClient.admin.customCommands.doPost$('clone-git-project', {
                    url: 'https://github.com/youwol/todo-app-js.git',
                    name: projectName,
                }),
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('pyYouwol.admin.projects.status', (done) => {
    const expectResp = (resp) => {
        expect(resp.results).toHaveLength(1)
        expectAttributes(resp.results[0], ['path', 'name', 'version', 'id'])
        expectAttributes(resp.results[0]['pipeline'], [
            'target',
            'tags',
            'steps',
            'flows',
        ])
        expect(resp.results[0]['name']).toBe(projectName)
    }
    combineLatest([
        pyYouwol.admin.projects.status$().pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.status$(),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expectResp(respHttp)
            expectResp(respWs.data)
            // respWs contains more fields than respHttp...e.g. pipeline.target (related to pb with union?)
            // expect(respHttp).toEqual(respWs.data)
            done()
        })
})

test('pyYouwol.admin.projects.flowStatus', (done) => {
    const expectResp = (resp) => {
        expect(resp.projectId).toEqual(btoa(projectName))
        expect(resp.steps).toHaveLength(4)
        resp.steps.slice(0, 3).forEach((step) => {
            expectAttributes(step, [
                'projectId',
                'flowId',
                'stepId',
                'artifacts',
            ])
            expect(step.status).toBe('none')
        })
    }

    combineLatest([
        pyYouwol.admin.projects
            .flowStatus$(btoa(projectName), 'prod')
            .pipe(raiseHTTPErrors()),
        pyYouwol.admin.projects.webSocket.pipelineStatus$(),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expectResp(respHttp)
            expect(respHttp).toEqual(respWs.data)
            done()
        })
})

function run$(stepId: string) {
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
    const currentStep$ = new BehaviorSubject('init')

    currentStep$
        .pipe(
            mergeMap((stepId) => run$(stepId)),
            shareReplay(1),
        )
        .subscribe((stepResp) => {
            expect(stepResp.status).toBe('OK')
            if (currentStep$.getValue() == 'init') {
                expectInitStep(stepResp)
                currentStep$.next('build')
                return
            }
            if (currentStep$.getValue() == 'build') {
                expectBuildStep(stepResp)
                currentStep$.next('publish-local')
                return
            }
            if (currentStep$.getValue() == 'publish-local') {
                expectPublishLocal(stepResp)
                currentStep$.next('publish-remote')
                return
            }
            if (currentStep$.getValue() == 'publish-remote') {
                done()
            }
        })
})
