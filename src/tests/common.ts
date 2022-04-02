import { raiseHTTPErrors, RootRouter } from '../lib'
import { PyYouwolClient } from '../lib/py-youwol'
import {
    AssetsGatewayClient,
    DefaultDriveResponse,
} from '../lib/assets-gateway'
import { map } from 'rxjs/operators'

RootRouter.HostName = getPyYouwolBasePath()
RootRouter.Headers = { 'py-youwol-local-only': 'true' }

export function getPyYouwolBasePath() {
    return 'http://localhost:2001'
}

export function resetPyYouwolDbs$() {
    return new PyYouwolClient().admin.customCommands.doGet$('reset')
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
