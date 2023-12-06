import '../mock-requests'
import { shell$ } from '../common'

import { healthz } from './shell'
import { LocalYouwol } from '@youwol/http-primitives'
import { firstValueFrom } from 'rxjs'

beforeAll(async () => {
    await firstValueFrom(
        LocalYouwol.setup$({
            localOnly: true,
            authId: 'int_tests_yw-users@test-user',
        }),
    )
})

test('healthz', async () => {
    class Context {}

    const resp = await firstValueFrom(shell$<Context>().pipe(healthz()))
    expect(resp).toBeTruthy()
})
