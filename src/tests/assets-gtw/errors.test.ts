import { ReplaySubject } from 'rxjs'
import {
    dispatchHTTPErrors,
    HTTPError,
    muteHTTPErrors,
    onHTTPErrors,
    raiseHTTPErrors,
} from '../../lib'
import { Asset, AssetsGatewayClient } from '../../lib/assets-gateway'
import { resetPyYouwolDbs$ } from '../common'
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import '../mock-requests'

const assetsGtw = new AssetsGatewayClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

test('assetsGtw.assets.get$, 404, dispatch error', (done) => {
    const error$ = new ReplaySubject<HTTPError>(1)
    assetsGtw.assets
        .get$('tutu')
        .pipe(dispatchHTTPErrors(error$))
        .subscribe(() => {
            throw Error('Should not pass here')
        })
    error$.subscribe((error: HTTPError) => {
        expect(error.status).toBe(404)
        expect(error.body['detail']).toBeTruthy()
        done()
    })
})

test('assetsGtw.assets.get$, 404, raise error', (done) => {
    assetsGtw.assets
        .get$('tutu')
        .pipe(raiseHTTPErrors())
        .subscribe(
            () => {
                throw Error('Should not pass here')
            },
            (error) => {
                expect(error.status).toBe(404)
                expect(error.body['detail']).toBeTruthy()
                done()
            },
        )
})

test('assetsGtw.assets.get$, 404, on error', (done) => {
    assetsGtw.assets
        .get$('tutu')
        .pipe(onHTTPErrors(() => 'an error occurred'))
        .subscribe((resp: Asset | string) => {
            if (typeof resp != 'string') {
                throw Error('Should not pass here')
            }
            expect(resp).toBe('an error occurred')
            done()
        })
})

test('assetsGtw.assets.get$, 404, muteHTTPErrors', (done) => {
    assetsGtw.assets
        .get$('tutu')
        .pipe(muteHTTPErrors())
        .subscribe(() => {
            throw Error('Should not pass here')
        })
    setTimeout(() => {
        expect(true).toBeTruthy()
        done()
    }, 50)
})
/* eslint-enable jest/no-done-callback -- re-enable */
