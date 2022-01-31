import './mock-requests'
import {CdnSessionsStorageClient, HealthzResponse} from '../lib/cdn-sessions-storage'

import {resetPyYouwolDbs$} from './common'
import {skipHTTPError} from "../lib/utils";

let storage = new CdnSessionsStorageClient()


beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

let testData = {
    content: 'some content'
}

test('query healthz', (done) => {

    storage.getHealthz$().pipe(
        skipHTTPError()
    ).subscribe((resp) => {
        expect(resp.status).toEqual('cdn-sessions-storage ok')
        done()
    })
})

test('get data', (done) => {

    storage.applications.getData$(
        "@youwol/platform-essentials",
        "integration-tests"
    ).subscribe((resp: any) => {
        expect(resp).toEqual({})
        done()
    })
})

test('post data', (done) => {

    storage.applications.postData$(
        "@youwol/platform-essentials",
        "integration-tests",
        testData
    ).subscribe((resp: {}) => {
        expect(resp).toEqual({})
        done()
    })
})

test('get data', (done) => {

    storage.applications.getData$(
        "@youwol/platform-essentials",
        "integration-tests"
    ).subscribe((resp: any) => {
        expect(resp).toEqual(testData)
        done()
    })
})


