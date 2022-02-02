/** @format */

import './mock-requests'
// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import {
    Asset,
    AssetsGatewayClient,
    ChildrenFolderResponse,
    DefaultDriveResponse,
    DriveResponse,
    DrivesResponse,
    FolderResponse,
    GroupsResponse,
    HealthzResponse,
    ItemResponse,
    PermissionsResponse,
} from '../lib/assets-gateway'
import { mergeMap } from 'rxjs/operators'
import { expectAttributes, resetPyYouwolDbs$ } from './common'
import { muteHTTPErrors, RequestEvent } from '../lib/utils'
import { ReplaySubject } from 'rxjs'

const assetsGtw = new AssetsGatewayClient()

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

const privateGrpPath = 'private'
let privateGrpId: string
let defaultDriveId: string
let homeFolderId: string
let newDriveId: string
let workingFolderId: string
const ywUsersGrpPath = '/youwol-users'

test('assetsGtw.getHealthz()', (done) => {
    const monitoring = {
        requestId: 'healthz',
        channels$: new ReplaySubject<RequestEvent>(),
    }
    const events = []
    monitoring.channels$.subscribe((event) => {
        events.push(event)
    })
    assetsGtw
        .getHealthz$({ monitoring })
        .pipe(muteHTTPErrors())
        .subscribe((resp: HealthzResponse) => {
            expect(resp.status).toBe('assets-gateway ok')
            expect(events).toEqual([
                {
                    requestId: 'healthz',
                    step: 'started',
                    transferredCount: 0,
                    totalCount: 1,
                    commandType: 'query',
                },
                {
                    requestId: 'healthz',
                    step: 'finished',
                    transferredCount: 1,
                    totalCount: 1,
                    commandType: 'query',
                },
            ])
            done()
        })
})

test('assetsGtw.queryGroups()', (done) => {
    assetsGtw
        .queryGroups()
        .pipe(muteHTTPErrors())
        .subscribe((resp: GroupsResponse) => {
            expect(resp.groups).toHaveLength(2)
            const ywUsersGrp = resp.groups.find((g) => g.path == ywUsersGrpPath)
            expect(ywUsersGrp).toBeTruthy()
            const privateGrp = resp.groups.find((g) => g.path == privateGrpPath)
            expect(privateGrp).toBeTruthy()
            privateGrpId = privateGrp.id
            done()
        })
})

test('assetsGtw.explorer.groups.getDefaultUserDrive$', (done) => {
    assetsGtw.explorer
        .getDefaultUserDrive$()
        .pipe(muteHTTPErrors())
        .subscribe((resp: DefaultDriveResponse) => {
            expectAttributes(resp, [
                'driveId',
                'driveName',
                'groupId',
                'homeFolderId',
                'homeFolderName',
                'downloadFolderId',
                'downloadFolderName',
                'systemFolderId',
                'systemFolderName',
                'systemPackagesFolderId',
                'systemPackagesFolderName',
                'desktopFolderId',
                'desktopFolderName',
            ])
            expect(resp.driveName).toBe('Default drive')
            defaultDriveId = resp.driveId
            homeFolderId = resp.homeFolderId
            done()
        })
})

test('assetsGtw.explorer.groups.getDefaultDrive$', (done) => {
    assetsGtw.explorer.groups
        .getDefaultDrive$(privateGrpId)
        .pipe(muteHTTPErrors())
        .subscribe((resp: DefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            expect(resp.driveId).toBe(defaultDriveId)
            done()
        })
})

test('assetsGtw.explorer.groups.queryDrives$', (done) => {
    assetsGtw.explorer.groups
        .queryDrives$(privateGrpId)
        .pipe(muteHTTPErrors())
        .subscribe((resp: DrivesResponse) => {
            expect(resp.drives).toHaveLength(1)
            const defaultDrive = resp.drives[0]
            expectAttributes(defaultDrive, ['name', 'driveId'])
            expect(defaultDrive.driveId).toEqual(defaultDriveId)
            done()
        })
})

test('assetsGtw.explorer.drives.get$', (done) => {
    assetsGtw.explorer.drives
        .get$(defaultDriveId)
        .subscribe((resp: DriveResponse) => {
            expectAttributes(resp, ['name', 'driveId'])
            done()
        })
})

test('assetsGtw.explorer.drives.rename$', (done) => {
    assetsGtw.explorer.drives
        .rename$(defaultDriveId, { name: 'new name' })
        .pipe(mergeMap(() => assetsGtw.explorer.drives.get$(defaultDriveId)))
        .subscribe((resp: DriveResponse) => {
            expect(resp.name).toBe('new name')
            done()
        })
})

test('assetsGtw.explorer.folders.queryChildren$ => default folders in default drive', (done) => {
    assetsGtw.explorer.folders
        .queryChildren$(defaultDriveId)
        .pipe(muteHTTPErrors())
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.folders).toHaveLength(4)
            expect(resp.items).toHaveLength(0)
            done()
        })
})

test('assetsGtw.explorer.groups.createDrive$', (done) => {
    assetsGtw.explorer.groups
        .createDrive$(privateGrpId, { name: 'test drive' })
        .pipe(muteHTTPErrors())
        .subscribe((resp: DriveResponse) => {
            expectAttributes(resp, ['name', 'driveId', 'groupId'])
            expect(resp.name).toBe('test drive')
            newDriveId = resp.driveId
            done()
        })
})

test('assetsGtw.explorer.folders.create$', (done) => {
    const folderName = 'test folder'
    assetsGtw.explorer.folders
        .create$(homeFolderId, { name: folderName })
        .pipe(muteHTTPErrors())
        .subscribe((resp: FolderResponse) => {
            expectAttributes(resp, [
                'name',
                'folderId',
                'parentFolderId',
                'driveId',
            ])
            workingFolderId = resp.folderId
            expect(resp.name).toEqual(folderName)
            done()
        })
})

let storyTreeId: string
let storyAssetId: string

test('assetsGtw.assets.story.create$', (done) => {
    assetsGtw.assets.story
        .create$(homeFolderId, {
            title: 'test-story',
        })
        .pipe(muteHTTPErrors())
        .subscribe((resp: Asset) => {
            expectAttributes(resp, ['assetId', 'rawId', 'treeId'])
            storyTreeId = resp.treeId
            storyAssetId = resp.assetId
            expect(resp.name).toBe('test-story')
            done()
        })
})

test('assetsGtw.explorer.items.get$', (done) => {
    assetsGtw.explorer.items
        .get$(storyTreeId)
        .pipe(muteHTTPErrors())
        .subscribe((resp: ItemResponse) => {
            expectAttributes(resp, ['assetId', 'rawId', 'treeId'])
            expect(resp.name).toBe('test-story')
            done()
        })
})

test('assetsGtw.explorer.getPermissions$', (done) => {
    assetsGtw.explorer
        .getPermissions$(storyTreeId)
        .pipe(muteHTTPErrors())
        .subscribe((resp: PermissionsResponse) => {
            expect(resp.read).toBeTruthy()
            expect(resp.write).toBeTruthy()
            expect(resp.share).toBeTruthy()

            done()
        })
})

test('assetsGtw.explorer.items.borrowItem$', (done) => {
    assetsGtw.explorer
        .borrowItem$(storyTreeId, { destinationFolderId: workingFolderId })
        .pipe(muteHTTPErrors())
        .subscribe((resp: ItemResponse) => {
            expectAttributes(resp, ['assetId', 'rawId', 'treeId'])
            expect(resp.name).toBe('test-story')
            expect(resp.borrowed).toBeTruthy()
            done()
        })
})

test('assetsGtw.explorer.move$', (done) => {
    assetsGtw.explorer
        .move$(storyTreeId, { destinationFolderId: workingFolderId })
        .pipe(muteHTTPErrors())
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.items[0].assetId).toBe(storyAssetId)
            expect(resp.items[1].assetId).toBe(storyAssetId)
            expect(
                (resp.items[0].borrowed && !resp.items[1].borrowed) ||
                    (resp.items[1].borrowed && !resp.items[0].borrowed),
            ).toBeTruthy()
            done()
        })
})

test('assetsGtw.explorer.items.delete$', (done) => {
    assetsGtw.explorer.items
        .delete$(storyTreeId)
        .pipe(muteHTTPErrors())
        .subscribe((resp) => {
            expect(resp).toEqual({})
            done()
        })
})

test('assetsGtw.explorer.folders.rename$', (done) => {
    const folderName = 'test folder renamed'
    assetsGtw.explorer.folders
        .rename$(homeFolderId, { name: folderName })
        .pipe(muteHTTPErrors())
        .subscribe((resp: FolderResponse) => {
            expect(resp.folderId).toBe(homeFolderId)
            expect(resp.name).toEqual(folderName)
            done()
        })
})

test('assetsGtw.explorer.folders.queryChildren$', (done) => {
    assetsGtw.explorer.folders
        .queryChildren$(homeFolderId)
        .pipe(muteHTTPErrors())
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.folders).toHaveLength(1)
            expect(resp.items).toHaveLength(0)
            expect(resp.folders[0].folderId).toEqual(workingFolderId)
            done()
        })
})

test('assetsGtw.explorer.folders.delete$', (done) => {
    assetsGtw.explorer.folders
        .delete$(workingFolderId)
        .pipe(
            muteHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.explorer.folders.queryChildren$(homeFolderId)
            }),
        )
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.folders).toHaveLength(0)
            expect(resp.items).toHaveLength(0)
            done()
        })
})

test('assetsGtw.explorer.drives.queryDeletedItems$', (done) => {
    assetsGtw.explorer.drives
        .queryDeletedItems$(defaultDriveId)
        .pipe(muteHTTPErrors())
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.items).toHaveLength(1)
            expect(resp.folders).toHaveLength(1)
            done()
        })
})

test('assetsGtw.explorer.drives.purge$', (done) => {
    assetsGtw.explorer.drives
        .purge$(defaultDriveId)
        .pipe(muteHTTPErrors())
        .subscribe((resp) => {
            expect(resp.foldersCount).toBe(1)
            done()
        })
})

test('assetsGtw.explorer.drives.delete$', (done) => {
    assetsGtw.explorer.drives
        .delete$(newDriveId)
        .pipe(
            muteHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.explorer.groups.queryDrives$(privateGrpId)
            }),
        )
        .subscribe((resp: DrivesResponse) => {
            expect(resp.drives.find((d) => d.driveId == newDriveId)).toBeFalsy()
            done()
        })
})
