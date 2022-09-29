// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import '../mock-requests'
import { shell$ } from '../common'
import { getAsset, getPermissions } from '../assets-backend/shell'
import { setup$ } from './utils'
import { remoteStoryAssetId } from '../remote_assets_id'

beforeEach((done) => {
    setup$({
        localOnly: false,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('can retrieve asset info when remote only', (done) => {
    class Context {
        // the creation of the test data is gathered in the youwol-config.py
        public readonly assetId = remoteStoryAssetId
    }

    shell$<Context>(new Context())
        .pipe(
            getAsset({
                inputs: (shell) => {
                    return {
                        assetId: shell.context.assetId,
                    }
                },
                sideEffects: (response, shell) => {
                    expect(response.assetId).toBe(shell.context.assetId)
                },
            }),
            getPermissions({
                inputs: (shell) => {
                    return {
                        assetId: shell.context.assetId,
                    }
                },
                sideEffects: (response) => {
                    expect(response.write).toBeTruthy()
                    expect(response.read).toBeTruthy()
                    expect(response.share).toBeTruthy()
                },
            }),
        )
        .subscribe(() => {
            done()
        })
})
