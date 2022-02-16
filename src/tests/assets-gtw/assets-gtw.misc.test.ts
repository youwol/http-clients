/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import '../mock-requests'
import { AssetsGatewayClient } from '../../lib/assets-gateway'
import { raiseHTTPErrors } from '../../lib'
import { mergeMap, tap } from 'rxjs/operators'

import { EmojisResponse } from '../../lib/assets-gateway/routers/misc/interfaces'
import { expectAttributes, resetPyYouwolDbs$ } from '../common'

const assetsGtw = new AssetsGatewayClient()

beforeAll(async (done) => {
    jest.setTimeout(90 * 1000)
    resetPyYouwolDbs$()
        .pipe(
            mergeMap(() => assetsGtw.explorer.getDefaultUserDrive$()),
            raiseHTTPErrors(),
        )
        .subscribe(() => {
            done()
        })
})

test('emojis', (done) => {
    assetsGtw.misc
        .queryEmojis$('animals')
        .pipe(
            raiseHTTPErrors(),
            tap((resp: EmojisResponse) => {
                expectAttributes(resp, ['emojis'])
                expect(resp.emojis).toBeInstanceOf(Array)
            }),
        )
        .subscribe(() => {
            done()
        })
})
