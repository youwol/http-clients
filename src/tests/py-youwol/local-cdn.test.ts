import { Client, install } from '@youwol/cdn-client'
import { combineLatest, from } from 'rxjs'
import { mergeMap, reduce, take, tap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import { PyYouwolClient } from '../../lib/py-youwol'

import {
    expectAttributes,
    getPyYouwolBasePath,
    resetPyYouwolDbs$,
} from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import { expectDownloadEvents$, expectUpdateStatus } from './utils'

const pyYouwol = new PyYouwolClient()

beforeEach(async (done) => {
    jest.setTimeout(20 * 1000)
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

test('pyYouwol.admin.local-cdn.collectUpdates - empty', (done) => {
    combineLatest([
        pyYouwol.admin.localCdn
            .triggerCollectUpdates$()
            .pipe(raiseHTTPErrors()),
        pyYouwol.admin.localCdn.webSocket.updatesStatus$(),
    ])
        .pipe(take(1))
        .subscribe(([respHttp, respWs]) => {
            expect(respHttp.updates).toHaveLength(0)
            expect(respWs.data.updates).toHaveLength(0)
            expect(respWs.attributes.topic).toBe('updatesCdn')
            done()
        })
})

test('install & pyYouwol.admin.local-cdn.collectUpdates', (done) => {
    Client.HostName = getPyYouwolBasePath()

    from(
        install({
            modules: ['@youwol/http-clients'],
        }),
    )
        .pipe(
            tap(() => {
                expect(window['rxjs']).toBeTruthy()
                expect(window['@youwol/http-clients']).toBeTruthy()
            }),
            mergeMap(() => {
                return pyYouwol.admin.localCdn.webSocket.downloadedPackage$()
            }),
            tap((resp) => {
                expectAttributes(resp.attributes, [
                    'packageName',
                    'packageVersion',
                ])
            }),
            take(2),
            reduce((acc, e) => {
                return [...acc, e]
            }, []),
            tap((updates) => {
                expect(updates.map((p) => p.data.packageName).sort()).toEqual([
                    '@youwol/http-clients',
                    'rxjs',
                ])
            }),
            mergeMap(() => {
                return pyYouwol.admin.localCdn
                    .triggerCollectUpdates$()
                    .pipe(raiseHTTPErrors())
            }),
        )
        .subscribe((respHttp) => {
            expect(respHttp.updates).toHaveLength(2)
            const httpClient = respHttp.updates.find(
                (update) => update.packageName == '@youwol/http-clients',
            )
            expectUpdateStatus(httpClient)
            done()
        })
})

test('download', (done) => {
    Client.HostName = getPyYouwolBasePath()

    expectDownloadEvents$(pyYouwol).subscribe(() => done())

    pyYouwol.admin.localCdn
        .download$({
            packages: [
                {
                    packageName: 'lodash',
                    version: '4.17.15',
                },
            ],
            checkUpdateStatus: true,
        })
        .pipe(
            mergeMap(() => {
                return pyYouwol.admin.localCdn.webSocket.updateStatus$()
            }),
            take(1),
        )
        .subscribe((respWs) => {
            expect(respWs).toBeTruthy()
            expectUpdateStatus(respWs.data)
        })
})
/* eslint-enable jest/no-done-callback -- re-enable */
