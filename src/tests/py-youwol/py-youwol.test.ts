import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'

import { expectAttributes } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import { setup$ } from './utils'

const pyYouwol = new PyYouwolClient()

beforeEach(async (done) => {
    setup$({
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('query healthz', (done) => {
    pyYouwol
        .getHealthz$()
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp.status).toBe('py-youwol ok')
            done()
        })
})

test('pyYouwol.admin.environment.login', (done) => {
    pyYouwol.admin.environment
        .login$({ body: { email: 'int_tests_yw-users_bis@test-user' } })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAttributes(resp, ['id', 'name', 'email', 'memberOf'])
            expect(resp.name).toBe('int_tests_yw-users_bis@test-user')
            done()
        })
})

test('pyYouwol.admin.customCommands.doPost$', (done) => {
    pyYouwol.admin.customCommands
        .doPost$({
            name: 'test-cmd-post',
            body: {
                returnObject: { status: 'test-cmd-post ok' },
            },
        })
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'test-cmd-post ok' })
            done()
        })
})

test('pyYouwol.admin.customCommands.doPut$', (done) => {
    pyYouwol.admin.customCommands
        .doPut$({
            name: 'test-cmd-put',
            body: {
                returnObject: { status: 'test-cmd-put ok' },
            },
        })
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'test-cmd-put ok' })
            done()
        })
})

test('pyYouwol.admin.customCommands.doDelete$', (done) => {
    pyYouwol.admin.customCommands
        .doDelete$({ name: 'test-cmd-delete' })
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'deleted' })
            done()
        })
})
/* eslint-enable jest/no-done-callback -- re-enable */
