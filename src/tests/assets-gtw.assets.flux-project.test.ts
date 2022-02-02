/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import './mock-requests'
import {
    Asset,
    AssetsGatewayClient,
    DefaultDriveResponse,
    Project,
} from '../lib/assets-gateway'
import { expectAttributes, resetPyYouwolDbs$ } from './common'
import { raiseHTTPErrors } from '../lib/utils'

const assetsGtw = new AssetsGatewayClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

let homeFolderId: string
let rawId: string

test('assetsGtw.explorer.groups.getDefaultUserDrive$', (done) => {
    assetsGtw.explorer
        .getDefaultUserDrive$()
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            homeFolderId = resp.homeFolderId
            done()
        })
})

test('assetsGtw.assets.fluxProject.create$', (done) => {
    assetsGtw.assets.fluxProject
        .create$(homeFolderId, {
            name: 'test',
            description: 'platform-essentials integration test',
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Asset) => {
            expectAttributes(resp, [
                'assetId',
                'rawId',
                'treeId',
                'description',
                'name',
                'kind',
                'groupId',
                'images',
                'thumbnails',
                'tags',
                //'permissions'
            ])
            expect(resp.name).toBe('test')
            expect(resp.description).toBe(
                'platform-essentials integration test',
            )
            rawId = resp.rawId
            done()
        })
})

test('assetsGtw.assets.fluxProject.queryProject$', (done) => {
    assetsGtw.raw.fluxProject
        .getProject$(rawId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Project) => {
            expect(resp.name).toBe('test')
            done()
        })
})

test('assetsGtw.assets.fluxProject.updateMetadata$', (done) => {
    assetsGtw.raw.fluxProject
        .updateMetadata$(rawId, {
            description: 'Updated description',
            libraries: {},
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp).toEqual({})
            done()
        })
})
