/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import './mock-requests'
import {
    AccessInfo,
    Asset,
    AssetsGatewayClient,
    DefaultDriveResponse,
    ExposingGroup,
    GroupsResponse,
    HealthzResponse,
    UserInfoResponse,
} from '../lib/assets-gateway'
import {
    expectAssetAttributes,
    expectAttributes,
    resetPyYouwolDbs$,
} from './common'
import { onHTTPErrors, raiseHTTPErrors, RequestEvent } from '../lib/utils'
import { readFileSync } from 'fs'
import path from 'path'
import { Subject } from 'rxjs'

const assetsGtw = new AssetsGatewayClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

const privateGrpPath = 'private'
let privateGrpId: string
let homeFolderId: string

it('assetsGtw.getHealthz$', (done) => {
    assetsGtw
        .getHealthz$()
        .pipe(raiseHTTPErrors())
        .subscribe((resp: HealthzResponse) => {
            expect(resp.status).toBe('assets-gateway ok')
            done()
        })
})

it('assetsGtw.getUserInfo$', (done) => {
    assetsGtw
        .getUserInfo$()
        .pipe(raiseHTTPErrors())
        .subscribe((resp: UserInfoResponse) => {
            expectAttributes(resp, ['name', 'groups'])
            expect(true).toBeTruthy()
            done()
        })
})

test('assetsGtw.queryGroups$', (done) => {
    assetsGtw
        .queryGroups()
        .pipe(raiseHTTPErrors())
        .subscribe((resp: GroupsResponse) => {
            const privateGrp = resp.groups.find((g) => g.path == privateGrpPath)
            expect(privateGrp).toBeTruthy()
            privateGrpId = privateGrp.id
            done()
        })
})

// eslint-disable-next-line jest/expect-expect -- eslint-comment expect hidden in 'expectAttributes'
test('assetsGtw.explorer.groups.getDefaultDrive$', (done) => {
    assetsGtw.explorer.groups
        .getDefaultDrive$(privateGrpId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DefaultDriveResponse) => {
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
            expect(resp.name).toBe('test')
            done()
        })
})

let storyAssetId = undefined

test('assetsGtw.assets.story.create$', (done) => {
    assetsGtw.assets.story
        .create$(homeFolderId, {
            title: 'test-story',
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Asset) => {
            expectAssetAttributes(resp)
            storyAssetId = resp.assetId
            expect(resp.name).toBe('test-story')
            done()
        })
})

test('assetsGtw.assets.get$', (done) => {
    assetsGtw.assets
        .get$(storyAssetId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Asset) => {
            expectAttributes(resp, [
                'assetId',
                'rawId',
                'description',
                'name',
                'kind',
                'groupId',
                'images',
                'thumbnails',
                'tags',
                'permissions',
            ])
            expect(resp.name).toBe('test-story')
            done()
        })
})

test('assetsGtw.assets.getAccess$', (done) => {
    assetsGtw.assets
        .getAccess$(storyAssetId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: AccessInfo) => {
            expectAttributes(resp, ['owningGroup', 'ownerInfo', 'consumerInfo'])
            expect(resp.consumerInfo.permissions).toEqual({
                write: true,
                read: true,
                share: true,
                expiration: null,
            })
            expect(resp.ownerInfo.exposingGroups).toEqual([])
            expect(resp.ownerInfo.defaultAccess).toEqual({
                read: 'forbidden',
                share: 'forbidden',
                expiration: null,
            })
            done()
        })
})

test('assetsGtw.assets.updateAccess$', (done) => {
    const groupId = btoa('/youwol-users')
    assetsGtw.assets
        .updateAccess$(storyAssetId, groupId, {
            read: 'authorized',
            share: 'authorized',
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: ExposingGroup) => {
            expectAttributes(resp, ['name', 'groupId', 'access'])
            expect(resp.access).toEqual({
                read: 'authorized',
                share: 'authorized',
                expiration: null,
            })
            done()
        })
})

test('assetsGtw.assets.update$', (done) => {
    assetsGtw.assets
        .update$(storyAssetId, {
            name: 'renamed story',
            tags: ['story'],
            description: 'update asset',
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Asset) => {
            expectAttributes(resp, ['assetId', 'rawId'])
            done()
        })
})

test('assetsGtw.assets.removePicture$ 404', (done) => {
    assetsGtw.assets
        .removePicture$(storyAssetId, 'not found picture')
        .pipe(
            onHTTPErrors((error) => {
                expect(error.status).toBe(404)
                return 'ok'
            }),
        )
        .subscribe((resp) => {
            expect(resp).toBe('ok')
            done()
        })
})

test('assetsGtw.assets.addPicture$', (done) => {
    const channel$ = new Subject<RequestEvent>()
    const buffer = readFileSync(path.resolve(__dirname, './img.png'))
    const arraybuffer = Uint8Array.from(buffer).buffer
    const events = []
    channel$.subscribe((event) => {
        events.push(event)
    })
    const monitoring = {
        requestId: 'add-image',
        channels$: channel$,
    }
    assetsGtw.assets
        .addPicture$(storyAssetId, 'test.png', new Blob([arraybuffer]), {
            monitoring,
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expectAssetAttributes(resp)
            expect(resp.images).toHaveLength(1)
            expect(resp.thumbnails).toHaveLength(1)
            expect(events).toEqual([
                {
                    requestId: 'add-image',
                    step: 'started',
                    transferredCount: 0,
                    totalCount: 0,
                    commandType: 'upload',
                },
                {
                    requestId: 'add-image',
                    step: 'transferring',
                    transferredCount: 5468,
                    totalCount: 0,
                    commandType: 'upload',
                },
                {
                    requestId: 'add-image',
                    step: 'finished',
                    transferredCount: 0,
                    totalCount: 0,
                    commandType: 'upload',
                },
            ])
            done()
        })
})

test('assetsGtw.assets.removePicture$ 200', (done) => {
    assetsGtw.assets
        .removePicture$(storyAssetId, 'test.png')
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp.images).toHaveLength(0)
            expect(resp.thumbnails).toHaveLength(0)
            done()
        })
})
