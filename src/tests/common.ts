import { raiseHTTPErrors, RootRouter } from '@youwol/http-primitives'
import { AssetsGatewayClient } from '../lib/assets-gateway'
import { map } from 'rxjs/operators'
import { Observable, OperatorFunction } from 'rxjs'
import { GetDefaultDriveResponse } from '../lib/explorer-backend'

RootRouter.HostName = getPyYouwolBasePath()
RootRouter.Headers = { 'py-youwol-local-only': 'true' }

export function getPyYouwolBasePath() {
    const url = globalThis.youwolJestPresetGlobals.integrationUrl
    if (globalThis.youwolJestPresetGlobals.debug) {
        console.log('URL in common.ts : ', url)
    }
    return url
}

export function expectAttributes(
    resp,
    attributes: Array<string | [string, string | number | boolean]>,
) {
    attributes.forEach((att) => {
        if (Array.isArray(att)) {
            if (resp[att[0]] == undefined) {
                console.log(`expected field '${att[0]}' not found`)
            }
            expect(resp[att[0]]).toEqual(att[1])
        } else {
            if (resp[att] == undefined) {
                console.log(`expected field '${att}' not found`)
            }
            expect(resp[att] != undefined).toBeTruthy()
        }
    })
}

export function expectAssetAttributes(resp: unknown) {
    expectAttributes(resp, [
        'assetId',
        'rawId',
        // 'treeId',
        //'description',
        'name',
        'kind',
        'groupId',
        'images',
        'thumbnails',
        'tags',
        //'permissions'
    ])
}

export type ManagedError = 'ManagedError'

export class Shell<T> {
    homeFolderId: string
    defaultDriveId: string
    privateGroupId: string
    assetsGtw: AssetsGatewayClient
    context: T
    constructor(params: {
        homeFolderId: string
        privateGroupId: string
        defaultDriveId: string
        assetsGtw: AssetsGatewayClient
        context?: T
    }) {
        Object.assign(this, params)
    }
}

export function shell$<T>(context?: T) {
    const assetsGtw = new AssetsGatewayClient()
    return assetsGtw.explorer.getDefaultUserDrive$().pipe(
        raiseHTTPErrors(),
        map((resp: GetDefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            return new Shell<T>({
                homeFolderId: resp.homeFolderId,
                defaultDriveId: resp.driveId,
                privateGroupId: resp.groupId,
                assetsGtw,
                context,
            })
        }),
    )
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

export function finalize<TShell, TContext, TResp>({
    shell,
    cb,
    newShell,
}: {
    shell
    cb?: (shell: TShell, resp) => TContext
    newShell: (args) => TShell
}): OperatorFunction<TResp, TShell> {
    return (obs$: Observable<TResp>) => {
        return obs$.pipe(
            map((resp) => {
                if (!cb) {
                    return shell
                }
                const context = cb(shell, resp)
                return newShell({
                    ...shell,
                    context,
                })
            }),
        )
    }
}

export function newShellFromContext<TContext, TResp>(
    shell: Shell<TContext>,
    resp: TResp,
    newContext?: (s: Shell<TContext>, r: TResp) => TContext,
) {
    return newContext
        ? new Shell({ ...shell, context: newContext(shell, resp) })
        : shell
}
