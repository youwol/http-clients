/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import './mock-requests'

import { resetPyYouwolDbs$ } from './common'
import { raiseHTTPErrors } from '../lib/utils'
import { PyYouwolClient } from '../lib/py-youwol'

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
