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
