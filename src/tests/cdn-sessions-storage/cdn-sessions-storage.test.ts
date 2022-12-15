// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */

import '../mock-requests'
import { getData, postData, shell$, healthz } from './shell'
import { RootRouter, LocalYouwol } from '@youwol/http-primitives'
import { getPyYouwolBasePath } from '../common'

RootRouter.HostName = getPyYouwolBasePath()

beforeAll(async (done) => {
    LocalYouwol.setup$({
        localOnly: true,
        authId: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

const testData = {
    content: 'some content',
}

test('healthz', (done) => {
    class Context {}

    shell$<Context>()
        .pipe(healthz())
        .subscribe((resp) => {
            expect(resp).toBeTruthy()
            done()
        })
})

test('get data from empty db', (done) => {
    shell$()
        .pipe(
            getData(
                () => ({
                    packageName: '@youwol/platform-essentials',
                    dataName: 'integration-tests',
                    body: testData,
                }),
                (shell, resp) => {
                    expect(resp).toEqual({})
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('post/get data', (done) => {
    shell$()
        .pipe(
            postData(() => ({
                packageName: '@youwol/platform-essentials',
                dataName: 'integration-tests',
                body: testData,
            })),
            getData(
                () => ({
                    packageName: '@youwol/platform-essentials',
                    dataName: 'integration-tests',
                    body: testData,
                }),
                (shell, resp) => {
                    expect(resp).toEqual(testData)
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})
