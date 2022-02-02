/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import './mock-requests'
import {
    AssetsGatewayClient,
    DefaultDriveResponse,
} from '../lib/assets-gateway'
import {
    expectAssetAttributes,
    expectAttributes,
    resetPyYouwolDbs$,
} from './common'
import { muteHTTPErrors, raiseHTTPErrors } from '../lib/utils'
import { readFileSync } from 'fs'
import path from 'path'

const assetsGtw = new AssetsGatewayClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

let homeFolderId: string

test('assetsGtw.explorer.groups.getDefaultUserDrive$', (done) => {
    assetsGtw.explorer
        .getDefaultUserDrive$()
        .pipe(muteHTTPErrors())
        .subscribe((resp: DefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            homeFolderId = resp.homeFolderId
            done()
        })
})

let rawId: string

test('assetsGtw.assets.package.create$', (done) => {
    const buffer = readFileSync(path.resolve(__dirname, './cdn.zip'))
    const arraybuffer = Uint8Array.from(buffer).buffer

    assetsGtw.assets.package
        .upload$(homeFolderId, 'cdn.zip', new Blob([arraybuffer]))
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAssetAttributes(resp)
            rawId = resp.rawId
            done()
        })
})

test('assetsGtw.raw.package.queryMetadata$', (done) => {
    assetsGtw.raw.package
        .getMetadata$(rawId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAttributes(resp, [
                'name',
                'versions',
                'namespace',
                'id',
                'releases',
            ])
            expect(resp.name).toBe('@youwol/todo-app-js')
            done()
        })
})

test('assetsGtw.raw.package.getResource$', (done) => {
    assetsGtw.raw.package
        .getResource$(rawId, '0.0.0-next/package.json')
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAttributes(resp, ['name', 'version', 'main', 'scripts'])
            expect(resp['name']).toBe('@youwol/todo-app-js')
            expect(resp['version']).toBe('0.0.0-next')
            done()
        })
})
