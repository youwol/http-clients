import { mergeMap, reduce, skipWhile, take, tap } from 'rxjs/operators'
import {
    ContextMessage,
    DownloadEvent,
    GetCdnStatusResponse,
    PyYouwolClient,
    ResetCdnResponse,
} from '../../lib/py-youwol'

import { expectAttributes, getPyYouwolBasePath } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'
import { Client, install, ModulesInput } from '@youwol/cdn-client'
import { raiseHTTPErrors } from '../../lib'
import { Observable, of } from 'rxjs'
import { setup$ } from './utils'

const pyYouwol = new PyYouwolClient()

Client.HostName = getPyYouwolBasePath()

jest.setTimeout(10 * 1000)

beforeEach(async (done) => {
    setup$({
        localOnly: false,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

function testInstall(
    modules: ModulesInput,
    expectedStatus: 'succeeded' | 'failed' = 'succeeded',
) {
    return (
        source$: Observable<unknown>,
    ): Observable<ContextMessage<DownloadEvent>[]> => {
        return source$.pipe(
            mergeMap(() => {
                return install({
                    modules,
                })
            }),
            mergeMap(() => pyYouwol.admin.system.webSocket.downloadEvent$()),
            tap((event) => {
                // console.log(event.data)
                expect(event).toBeTruthy()
            }),
            skipWhile((event) => {
                return event.data.type != expectedStatus
            }),
            take(1),
            reduce((acc, e) => {
                /*if (acc.length == 0) {
                    expect(e.data.type).toBe('enqueued')
                }*/
                return [...acc, e]
            }, []),
            /*
            tap((events) => {
                const targets: DownloadEventType[] = [
                    'enqueued',
                    'started',
                    expectedStatus,
                ]
                expect(events.map((e) => e.data.type)).toEqual(targets)
            }),*/
        )
    }
}

test('install package rxjs', (done) => {
    of({})
        .pipe(testInstall(['rxjs']))
        .subscribe(() => {
            done()
        })
})

test('install package @youwol/logging#0.0.2-next => Failure', (done) => {
    of({})
        .pipe(
            //wait for websocket to connect
            take(1),
            testInstall(
                [{ name: '@youwol/logging', version: '0.0.2-next' }],
                'failed',
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('install package rxjs + clear + install package rxjs', (done) => {
    of({})
        .pipe(
            testInstall(['rxjs']),
            mergeMap(() => pyYouwol.admin.localCdn.resetCdn$()),
            raiseHTTPErrors(),
            tap((resp: ResetCdnResponse) => {
                expectAttributes(resp, ['deletedPackages'])
                expect(resp.deletedPackages).toEqual(['rxjs'])
                Client.resetCache()
            }),
            mergeMap(() => pyYouwol.admin.localCdn.getStatus$()),
            raiseHTTPErrors(),
            tap((status: GetCdnStatusResponse) => {
                expect(status.packages).toHaveLength(0)
            }),
            testInstall(['rxjs']),
        )
        .subscribe(() => {
            done()
        })
})
/* eslint-enable jest/no-done-callback -- re-enable */
