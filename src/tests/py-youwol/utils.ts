import { PyYouwolClient } from './py-youwol.client'
import { mergeMap, tap } from 'rxjs/operators'
import { RootRouter } from '../../lib'

export function resetPyYouwolDbs$(headers: { [k: string]: string } = {}) {
    return new PyYouwolClient(headers).admin.customCommands.doGet$({
        name: 'reset',
    })
}

export function setup$(
    { localOnly, email }: { localOnly?: boolean; email?: string } = {
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    },
) {
    //State.resetCache()
    const headers = {
        'py-youwol-local-only': localOnly ? 'true' : 'false',
    }
    return PyYouwolClient.startWs$().pipe(
        mergeMap(() =>
            new PyYouwolClient().admin.environment.login$({
                body: { email },
            }),
        ),
        mergeMap(() => {
            return resetPyYouwolDbs$(headers)
        }),
        tap(() => {
            RootRouter.Headers = headers
        }),
    )
}
