/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

import { resetPyYouwolDbs$ } from '../common'
import { PyYouwolClient } from '../../lib/py-youwol'
import { raiseHTTPErrors } from '../../lib'

const pyYouwol = new PyYouwolClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

test('pyYouwol.admin.customCommands.doPost$', (done) => {
    pyYouwol.admin.customCommands
        .doPost$('test-cmd-post', {
            returnObject: { status: 'test-cmd-post ok' },
        })
        .pipe(raiseHTTPErrors())
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
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'test-cmd-put ok' })
            done()
        })
})

test('pyYouwol.admin.customCommands.doDelete$', (done) => {
    pyYouwol.admin.customCommands
        .doDelete$('test-cmd-delete')
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp).toEqual({ status: 'deleted' })
            done()
        })
})
