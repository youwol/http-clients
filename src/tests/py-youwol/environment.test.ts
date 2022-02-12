/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import { onHTTPErrors, raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'
import { mergeMap, take } from 'rxjs/operators'
import { combineLatest } from 'rxjs'
import { expectEnvironment } from './utils'

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
            expectEnvironment(respHttp)

            expect(respHttp).toEqual(respWs.data)
            done()
        })
})

test('pyYouwol.admin.environment.switchProfile', (done) => {
    combineLatest([
        pyYouwol.admin.environment.switchProfile$({ active: 'default' }).pipe(
            onHTTPErrors(() => ({})),
            mergeMap(() =>
                pyYouwol.admin.environment.switchProfile$({
                    active: 'profile-1',
                }),
            ),
            raiseHTTPErrors(),
        ),
        pyYouwol.admin.environment.webSocket.status$({ profile: 'profile-1' }),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expect(respHttp.configuration.activeProfile).toBe('profile-1')
            expect(respWs.data.configuration.activeProfile).toBe('profile-1')
            expectEnvironment(respHttp)
            expectEnvironment(respWs.data)
            done()
        })
})

test('pyYouwol.admin.environment.reloadConfig', (done) => {
    combineLatest([
        pyYouwol.admin.environment.reloadConfig$().pipe(raiseHTTPErrors()),
        pyYouwol.admin.environment.webSocket.status$(),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expectEnvironment(respHttp)
            expectEnvironment(respWs.data)
            done()
        })
})
