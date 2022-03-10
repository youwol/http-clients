import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'

import { expectAttributes, resetPyYouwolDbs$ } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

const pyYouwol = new PyYouwolClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
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
        .login$({ email: 'int_tests_yw-users_bis@test-user' })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAttributes(resp, ['id', 'name', 'email', 'memberOf'])
            expect(resp.name).toBe('int_tests_yw-users_bis@test-user')
            done()
        })
})

test('pyYouwol.admin.customCommands.doPost$', (done) => {
    pyYouwol.admin.customCommands
        .doPost$('test-cmd-post', {
            returnObject: { status: 'test-cmd-post ok' },
        })
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'test-cmd-post ok' })
            done()
        })
})

test('pyYouwol.admin.customCommands.doPut$', (done) => {
    pyYouwol.admin.customCommands
        .doPut$('test-cmd-put', {
            returnObject: { status: 'test-cmd-put ok' },
        })
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'test-cmd-put ok' })
            done()
        })
})

test('pyYouwol.admin.customCommands.doDelete$', (done) => {
    pyYouwol.admin.customCommands
        .doDelete$('test-cmd-delete')
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'deleted' })
            done()
        })
})
/* eslint-enable jest/no-done-callback -- re-enable */
