import '../mock-requests'
import { Shell, wrap } from '../common'
import { GetHealthzResponse } from '../../lib/assets-gateway'
import { HTTPError } from '../../lib'

function newShellFromContext<TContext, TResp>(
    shell: Shell<TContext>,
    resp: TResp,
    newContext?: (s: Shell<TContext>, r: TResp) => TContext,
) {
    return newContext
        ? new Shell({ ...shell, context: newContext(shell, resp) })
        : shell
}

export function healthz<TContext>({
    newContext,
    authorizedErrors,
    sideEffects,
}: {
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: GetHealthzResponse) => TContext
} = {}) {
    return wrap<Shell<TContext>, GetHealthzResponse, TContext>({
        observable: (shell: Shell<TContext>) => shell.assetsGtw.getHealthz$(),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            expect(resp.status).toBe('assets-gateway ok')
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}
