import { combineLatest } from 'rxjs'
import { map, mergeMap, reduce, take, tap } from 'rxjs/operators'
import { raiseHTTPErrors, RootRouter } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'
import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import { Client } from '@youwol/cdn-client'

export function setup$(
    { localOnly, email }: { localOnly?: boolean; email?: string } = {
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    },
) {
    Client.resetCache()
    const headers = {
        'py-youwol-local-only': localOnly ? 'true' : 'false',
    }
    return PyYouwolClient.startWs$().pipe(
        mergeMap(() =>
            new PyYouwolClient().admin.environment.login$({
                body: { email },
            }),
        ),
        mergeMap(() => {
            return resetPyYouwolDbs$(headers)
        }),
        tap(() => {
            RootRouter.Headers = headers
        }),
    )
}

export function uniqueProjectName(prefix: string) {
    const now = new Date()
    return `@${prefix}/${now.getFullYear()}-${
        now.getMonth() + 1
    }-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
}

export function expectInitStep(stepResp) {
    expect(stepResp).toBeTruthy()
}

export function expectBuildStep(stepResp) {
    expect(stepResp.manifest.files).toHaveLength(3)
    expect(stepResp.artifacts).toHaveLength(1)
    expect(stepResp.artifacts[0].id).toBe('dist')
}

export function expectPublishLocal(stepResp) {
    expect(stepResp.manifest).toBeTruthy()
    expectAttributes(stepResp.manifest, [
        'succeeded',
        'fingerprint',
        'creationDate',
        'cmdOutputs',
    ])
    expect(stepResp.manifest.succeeded).toBeTruthy()
    expectAttributes(stepResp.manifest.cmdOutputs, [
        'name',
        'version',
        'id',
        'fingerprint',
        'srcFilesFingerprint',
        'srcBasePath',
        'srcFiles',
    ])
}

export function expectPublishRemote(stepResp) {
    expect(stepResp.status).toBe('OK')
}

export function expectFlowStatus(resp, projectName) {
    expect(resp.projectId).toEqual(
        Buffer.from(projectName, 'utf8').toString('base64'),
    )
    expect(resp.steps).toHaveLength(4)
    resp.steps.slice(0, 3).forEach((step) => {
        expectAttributes(step, ['projectId', 'flowId', 'stepId', 'artifacts'])
        expect(step.status).toBe('none')
    })
}

export function expectProjectsStatus(resp, projectName) {
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

export function expectProjectStatus(resp) {
    expectAttributes(resp, [
        'projectId',
        'projectName',
        'workspaceDependencies',
    ])
    expectAttributes(resp.workspaceDependencies, [
        'above',
        'below',
        'dag',
        'simpleDag',
    ])
}

export function expectEnvironment(resp) {
    expectAttributes(resp, [
        'configuration',
        'users',
        'userInfo',
        'remoteGatewayInfo',
        'remotesInfo',
    ])
    expectAttributes(resp.configuration, [
        'availableProfiles',
        'httpPort',
        'openidHost',
        'commands',
        'userEmail',
        'selectedRemote',
        'pathsBook',
    ])
}

export function expectUpdateStatus(resp) {
    expectAttributes(resp, [
        'packageName',
        'localVersionInfo',
        'remoteVersionInfo',
        'status',
    ])
    expectAttributes(resp.localVersionInfo, ['version', 'fingerprint'])
    expectAttributes(resp.remoteVersionInfo, ['version', 'fingerprint'])
}

export function expectPipelineStepEvents$(pyYouwol: PyYouwolClient) {
    return pyYouwol.admin.projects.webSocket.stepEvent$().pipe(
        map((ev) => ev.data),
        take(18),
        reduce((acc, e) => [...acc, e], []),
        tap((events) => {
            expect(events).toHaveLength(18)
            expect(events.filter((ev) => ev.stepId == 'init')).toHaveLength(3)
            expect(events.filter((ev) => ev.stepId == 'build')).toHaveLength(4)
            expect(
                events.filter((ev) => ev.stepId == 'publish-local'),
            ).toHaveLength(5)
            expect(
                events.filter((ev) => ev.stepId == 'publish-remote'),
            ).toHaveLength(6)
            expect(
                events.filter((ev) => ev.event == 'runStarted'),
            ).toHaveLength(4)
            expect(events.filter((ev) => ev.event == 'runDone')).toHaveLength(4)
        }),
    )
}

export function expectArtifacts$(pyYouwol: PyYouwolClient, projectId: string) {
    return combineLatest([
        pyYouwol.admin.projects
            .getArtifacts$({ projectId, flowId: 'prod' })
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
}

export function expectDownloadEvents$(pyYouwol: PyYouwolClient) {
    return pyYouwol.admin.localCdn.webSocket.packageEvent$().pipe(
        take(4),
        map((ev) => ev.data.event),
        reduce((acc, e) => [...acc, e], []),
        tap((events) => {
            expect(events).toEqual([
                'downloadStarted',
                'downloadDone',
                'updateCheckStarted',
                'updateCheckDone',
            ])
        }),
    )
}
