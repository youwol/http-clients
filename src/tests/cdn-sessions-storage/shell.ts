import '../mock-requests'
import { Json, raiseHTTPErrors } from '@youwol/http-primitives'
import { map, mergeMap } from 'rxjs/operators'
import { Observable, of, OperatorFunction } from 'rxjs'
import { CdnSessionsStorageClient } from '../../lib/cdn-sessions-storage'

export class Shell<T> {
    client: CdnSessionsStorageClient
    context: T
    constructor(params: { client: CdnSessionsStorageClient; context?: T }) {
        Object.assign(this, params)
    }
}

export function mapToShell<T, T1>(
    shell,
    cb?: (shell: Shell<T1>, resp) => T1,
): OperatorFunction<T, Shell<T1>> {
    return (obs$: Observable<T>) => {
        return obs$.pipe(
            map((resp) => {
                if (!cb) {
                    return shell
                }
                const context = cb(shell, resp)
                return new Shell({
                    ...shell,
                    context,
                })
            }),
        )
    }
}

export function shell$<T>(context?: T) {
    const client = new CdnSessionsStorageClient()
    return of(
        new Shell<T>({
            client,
            context,
        }),
    )
}

export function postData<T>(
    input: (shell: Shell<T>) => {
        packageName: string
        dataName: string
        body: Json
    },
    cb?: (shell: Shell<T>, resp: unknown) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.client
                    .postData$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}

export function getData<T>(
    input: (shell: Shell<T>) => { packageName: string; dataName: string },
    cb: (shell: Shell<T>, resp: Json) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                return shell.client
                    .getData$(input(shell))
                    .pipe(raiseHTTPErrors(), mapToShell(shell, cb))
            }),
        )
    }
}
