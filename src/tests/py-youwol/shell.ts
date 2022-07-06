import { Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { HTTPError, raiseHTTPErrors } from '../../lib'
import { AssetsGatewayClient } from '../../lib/assets-gateway'
import { PyYouwolClient, UploadAssetResponse } from '../../lib/py-youwol'
import { newShellFromContext, Shell, wrap } from '../common'

export function uploadAsset<TContext>({
    inputs,
    newContext,
    authorizedErrors,
    sideEffects,
}: {
    inputs: (shell: Shell<TContext>) => {
        assetId: string
    }
    authorizedErrors?: (resp: HTTPError) => boolean
    sideEffects?: (resp, shell: Shell<TContext>) => void
    newContext?: (shell: Shell<TContext>, resp: UploadAssetResponse) => TContext
}) {
    return wrap<Shell<TContext>, UploadAssetResponse, TContext>({
        observable: (shell: Shell<TContext>) =>
            new PyYouwolClient().admin.environment.uploadAsset$(inputs(shell)),
        authorizedErrors,
        sideEffects: (resp, shell) => {
            sideEffects && sideEffects(resp, shell)
        },
        newShell: (shell, resp) => newShellFromContext(shell, resp, newContext),
    })
}

export function switchToRemoteShell<TContext>() {
    return (source$: Observable<Shell<TContext>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return new PyYouwolClient().authorization
                    .getAccessToken$()
                    .pipe(
                        raiseHTTPErrors(),
                        map(({ accessToken }) => {
                            return new Shell({
                                ...shell,
                                assetsGtw: new AssetsGatewayClient({
                                    hostName: 'https://platform.youwol.com', // Should be dynamic, from py-youwol env
                                    headers: {
                                        authorization: `Bearer ${accessToken}`,
                                    },
                                }),
                                context: { ...shell.context, accessToken },
                            })
                        }),
                    )
            }),
        )
    }
}
