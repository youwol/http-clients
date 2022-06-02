import '../mock-requests'
import { shell$ } from '../common'
import { getAsset, getPermissions } from '../assets-backend/shell'
import { setup$ } from './utils'

beforeEach(async (done) => {
    setup$({
        localOnly: false,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('can retrieve asset info when remote only', (done) => {
    class Context {
        public readonly assetId =
            'YTZjZDhlMzYtYTE5ZC00YTI5LTg3NGQtMDRjMTI2M2E5YjA3'
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
