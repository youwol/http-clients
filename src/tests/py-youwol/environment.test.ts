import { combineLatest } from 'rxjs'
import { mergeMap, take, tap } from 'rxjs/operators'
import { onHTTPErrors, raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'

import { expectAttributes } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import { expectEnvironment, setup$ } from './utils'

const pyYouwol = new PyYouwolClient()

beforeAll(async (done) => {
    setup$().subscribe(() => {
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
        .pipe(
            take(1),
            tap(([respHttp, respWs]) => {
                expectEnvironment(respHttp)
                expect(respHttp).toEqual(respWs.data)
            }),
            mergeMap(() => {
                return pyYouwol.admin.environment.queryCowSay$()
            }),
            raiseHTTPErrors(),
            tap((resp) => {
                expect(typeof resp).toBe('string')
            }),
        )
        .subscribe(() => {
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
        .pipe(
            take(1),
            tap(([respHttp, respWs]) => {
                expectEnvironment(respHttp)
                expectEnvironment(respWs.data)
            }),
            mergeMap(() => {
                return pyYouwol.admin.environment.getFileContent$()
            }),
            raiseHTTPErrors(),
            tap((resp) => {
                expect(typeof resp).toBe('string')
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('pyYouwol.admin.environment.customDispatches', (done) => {
    pyYouwol.admin.environment
        .queryCustomDispatches$()
        .pipe(
            raiseHTTPErrors(),
            tap((resp) => {
                expectAttributes(resp, ['dispatches'])
                expectAttributes(resp.dispatches, ['BrotliDecompress'])
                expect(resp.dispatches.BrotliDecompress).toHaveLength(1)
            }),
        )
        .subscribe(() => {
            done()
        })
})

/* eslint-enable jest/no-done-callback -- re-enable */
