// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import { mergeMap, tap } from 'rxjs/operators'
import { raiseHTTPErrors } from '../../lib'
import { AssetsGatewayClient } from '../../lib/assets-gateway'

import { EmojisResponse } from '../../lib/assets-gateway'
import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import '../mock-requests'

const assetsGtw = new AssetsGatewayClient()

beforeAll(async (done) => {
    jest.setTimeout(90 * 1000)
    resetPyYouwolDbs$()
        .pipe(
            mergeMap(() => assetsGtw.explorerDeprecated.getDefaultUserDrive$()),
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
