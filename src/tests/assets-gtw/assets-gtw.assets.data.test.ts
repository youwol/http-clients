// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import { Subject } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { raiseHTTPErrors, RequestEvent } from '../../lib'
import { AssetsGatewayClient } from '../../lib/assets-gateway'
import { expectAssetAttributes, resetPyYouwolDbs$ } from '../common'
import '../mock-requests'

const assetsGtw = new AssetsGatewayClient()

let homeFolderId: string

beforeAll(async (done) => {
    resetPyYouwolDbs$()
        .pipe(
            mergeMap(() => assetsGtw.explorer.getDefaultUserDrive$()),
            raiseHTTPErrors(),
        )
        .subscribe((resp) => {
            homeFolderId = resp.homeFolderId
            done()
        })
})

let rawId: string
test('assetsGtw.assets.data.upload$', (done) => {
    assetsGtw.assets.data
        .upload$(homeFolderId, 'test-data.txt', new Blob(['hello world :)']))
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAssetAttributes(resp)
            rawId = resp.rawId
            done()
        })
})

test('assetsGtw.raw.data.download$', (done) => {
    const channel$ = new Subject<RequestEvent>()
    const events = []
    channel$.subscribe((event) => {
        events.push(event)
    })
    const monitoring = { channels$: channel$, requestId: 'download' }

    assetsGtw.raw.data
        .download$(rawId, { monitoring })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            const fileReader = new FileReader()
            fileReader.onload = () => {
                expect(events).toEqual([
                    {
                        requestId: 'download',
                        step: 'started',
                        transferredCount: 0,
                        totalCount: 0,
                        commandType: 'download',
                    },
                    {
                        requestId: 'download',
                        step: 'transferring',
                        transferredCount: 14,
                        totalCount: 0,
                        commandType: 'download',
                    },
                    {
                        requestId: 'download',
                        step: 'finished',
                        transferredCount: 0,
                        totalCount: 0,
                        commandType: 'download',
                    },
                ])
                expect(fileReader.result).toBe('hello world :)')
                done()
            }
            fileReader.readAsText(resp)
        })
})
