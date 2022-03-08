// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */

import { Json, raiseHTTPErrors } from '../../lib'
import { CdnSessionsStorageClient } from '../../lib/cdn-sessions-storage'

import { resetPyYouwolDbs$ } from '../common'
import '../mock-requests'

const storage = new CdnSessionsStorageClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

const testData = {
    content: 'some content',
}

test('query healthz', (done) => {
    storage
        .getHealthz$()
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp.status).toBe('cdn-sessions-storage ok')
            done()
        })
})

test('get data from empty db', (done) => {
    storage.applications
        .getData$('@youwol/platform-essentials', 'integration-tests')
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Json) => {
            expect(resp).toEqual({})
            done()
        })
})

test('post data', (done) => {
    storage.applications
        .postData$('@youwol/platform-essentials', 'integration-tests', testData)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Record<string, never>) => {
            expect(resp).toEqual({})
            done()
        })
})

test('get data', (done) => {
    storage.applications
        .getData$('@youwol/platform-essentials', 'integration-tests')
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Json) => {
            expect(resp).toEqual(testData)
            done()
        })
})
