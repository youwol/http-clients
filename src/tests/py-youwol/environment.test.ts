/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'
import { take } from 'rxjs/operators'
import { combineLatest } from 'rxjs'

const pyYouwol = new PyYouwolClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

test('pyYouwol.admin.environment.login', (done) => {
    pyYouwol.admin.environment
        .login$({ email: 'int_tests_yw-users_bis@test-user' })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAttributes(resp, ['id', 'name', 'email', 'memberOf'])
            expect(resp.name).toBe('int_tests_yw-users_bis@test-user')
            done()
        })
})

test('pyYouwol.admin.environment.status', (done) => {
    combineLatest([
        pyYouwol.admin.environment.status$().pipe(raiseHTTPErrors()),
        pyYouwol.admin.environment.webSocket.status$(),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expectAttributes(respHttp, [
                'configuration',
                'users',
                'userInfo',
                'remoteGatewayInfo',
                'remotesInfo',
            ])
            expectAttributes(respHttp.configuration, [
                'availableProfiles',
                'httpPort',
                'openidHost',
                'commands',
                'userEmail',
                'selectedRemote',
                'pathsBook',
            ])

            expect(respHttp).toEqual(respWs.data)
            done()
        })
})
