// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import '../mock-requests'
import { shell$ } from '../common'

import { healthz } from './shell'
import { LocalYouwol } from '@youwol/http-primitives'

beforeAll(async (done) => {
    LocalYouwol.setup$({
        localOnly: true,
        authId: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('healthz', (done) => {
    class Context {}

    shell$<Context>()
        .pipe(healthz())
        .subscribe((resp) => {
            expect(resp).toBeTruthy()
            done()
        })
})
