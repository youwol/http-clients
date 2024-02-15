import '../mock-requests'
import { getData, postData, shell$ } from './shell'
import { RootRouter, LocalYouwol } from '@youwol/http-primitives'
import { getPyYouwolBasePath } from '../common'
import { firstValueFrom } from 'rxjs'

RootRouter.HostName = getPyYouwolBasePath()

beforeAll(async () => {
    await firstValueFrom(
        LocalYouwol.setup$({
            localOnly: true,
            authId: 'int_tests_yw-users@test-user',
        }),
    )
})

const testData = {
    content: 'some content',
}

test('get data from empty db', async () => {
    const test$ = shell$().pipe(
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
    await firstValueFrom(test$)
})

test('post/get data', async () => {
    const test$ = shell$().pipe(
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

    await firstValueFrom(test$)
})
