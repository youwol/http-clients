/** @format */

import { expectAttributes } from '../common'

/** @format */

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
