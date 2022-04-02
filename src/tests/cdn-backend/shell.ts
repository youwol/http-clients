import '../mock-requests'
import { raiseHTTPErrors } from '../../lib'
import {
    AssetsGatewayClient,
    DefaultDriveResponse,
} from '../../lib/assets-gateway'
import { map, mergeMap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { readFileSync } from 'fs'
import { expectAssetAttributes, expectAttributes } from '../common'

export class Shell<T> {
    homeFolderId: string
    assetsGtw: AssetsGatewayClient
    data: T
    constructor(params: {
        homeFolderId: string
        assetsGtw: AssetsGatewayClient
        data?: T
    }) {
        Object.assign(this, params)
    }
}

export function shell$<T>() {
    const assetsGtw = new AssetsGatewayClient()
    return assetsGtw.explorer.getDefaultUserDrive$().pipe(
        raiseHTTPErrors(),
        map((resp: DefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            return new Shell<T>({ homeFolderId: resp.homeFolderId, assetsGtw })
        }),
    )
}

export function uploadPackage<T>(
    filePath: string,
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const buffer = readFileSync(filePath)
                const filename = filePath.split('/').slice(-1)[0]
                const arraybuffer = Uint8Array.from(buffer).buffer
                return shell.assetsGtw.assets.package
                    .upload$(
                        shell.homeFolderId,
                        filename,
                        new Blob([arraybuffer]),
                    )
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAssetAttributes(resp)
                            const data = cb(shell, resp)
                            return new Shell({
                                ...shell,
                                data,
                            })
                        }),
                    )
            }),
        )
    }
}

export function getRawMetadata<T>(
    input: (shell: Shell<T>) => { rawId: string },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const rawId = input(shell).rawId
                return shell.assetsGtw.raw.package.getMetadata$(rawId).pipe(
                    raiseHTTPErrors(),
                    map((resp) => {
                        expectAttributes(resp, [
                            'name',
                            'versions',
                            'namespace',
                            'id',
                            'releases',
                        ])
                        const data = cb(shell, resp)
                        return new Shell({
                            ...shell,
                            data,
                        })
                    }),
                )
            }),
        )
    }
}

export function getPackageFolderContent<T>(
    input: (shell: Shell<T>) => {
        rawId: string
        path: string
        version: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { rawId, path, version } = input(shell)
                return shell.assetsGtw.cdn
                    .queryExplorer$(rawId, version, path)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            expectAttributes(resp, ['folders', 'files'])
                            const data = cb(shell, resp)
                            return new Shell({
                                ...shell,
                                data,
                            })
                        }),
                    )
            }),
        )
    }
}

export function getResource<T>(
    input: (shell: Shell<T>) => {
        rawId: string
        path: string
    },
    cb: (shell: Shell<T>, resp) => T,
) {
    return (source$: Observable<Shell<T>>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const { rawId, path } = input(shell)
                return shell.assetsGtw.raw.package
                    .getResource$(rawId, path)
                    .pipe(
                        raiseHTTPErrors(),
                        map((resp) => {
                            const data = cb(shell, resp)
                            return new Shell({
                                ...shell,
                                data,
                            })
                        }),
                    )
            }),
        )
    }
}
