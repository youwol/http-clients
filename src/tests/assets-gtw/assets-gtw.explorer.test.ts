import { ReplaySubject } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { raiseHTTPErrors, RequestEvent } from '../../lib'
// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment Find a good way to work with rxjs in jest */
import {
    Asset,
    AssetsGatewayClient,
    ChildrenFolderResponse,
    DefaultDriveResponse,
    DeletedResponse,
    DriveResponse,
    DrivesResponse,
    FolderResponse,
    GroupsResponse,
    HealthzResponse,
    ItemResponse,
    PermissionsResponse,
} from '../../lib/assets-gateway'
import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import '../mock-requests'

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
        .pipe(raiseHTTPErrors())
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
        .pipe(raiseHTTPErrors())
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

test('assetsGtw.explorerDeprecated.groups.getDefaultUserDrive$', (done) => {
    assetsGtw.explorerDeprecated
        .getDefaultUserDrive$()
        .pipe(raiseHTTPErrors())
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

test('assetsGtw.explorerDeprecated.groups.getDefaultDrive$', (done) => {
    assetsGtw.explorerDeprecated.groups
        .getDefaultDrive$(privateGrpId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            expect(resp.driveId).toBe(defaultDriveId)
            done()
        })
})

test('assetsGtw.explorerDeprecated.groups.queryDrives$', (done) => {
    assetsGtw.explorerDeprecated.groups
        .queryDrives$(privateGrpId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DrivesResponse) => {
            expect(resp.drives).toHaveLength(1)
            const defaultDrive = resp.drives[0]
            expectAttributes(defaultDrive, ['name', 'driveId'])
            expect(defaultDrive.driveId).toEqual(defaultDriveId)
            done()
        })
})

test('assetsGtw.explorerDeprecated.drives.get$', (done) => {
    assetsGtw.explorerDeprecated.drives
        .get$(defaultDriveId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DriveResponse) => {
            expectAttributes(resp, ['name', 'driveId'])
            done()
        })
})

test('assetsGtw.explorerDeprecated.drives.rename$', (done) => {
    assetsGtw.explorerDeprecated.drives
        .rename$(defaultDriveId, { name: 'new name' })
        .pipe(
            mergeMap(() =>
                assetsGtw.explorerDeprecated.drives.get$(defaultDriveId),
            ),
        )
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DriveResponse) => {
            expect(resp.name).toBe('new name')
            done()
        })
})

test('assetsGtw.explorerDeprecated.folders.queryChildren$ => default folders in default drive', (done) => {
    assetsGtw.explorerDeprecated.folders
        .queryChildren$(defaultDriveId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.folders).toHaveLength(4)
            expect(resp.items).toHaveLength(0)
            done()
        })
})

test('assetsGtw.explorerDeprecated.groups.createDrive$', (done) => {
    assetsGtw.explorerDeprecated.groups
        .createDrive$(privateGrpId, { name: 'test drive' })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DriveResponse) => {
            expectAttributes(resp, ['name', 'driveId', 'groupId'])
            expect(resp.name).toBe('test drive')
            newDriveId = resp.driveId
            done()
        })
})

test('assetsGtw.explorerDeprecated.folders.create$', (done) => {
    const folderName = 'test folder'
    assetsGtw.explorerDeprecated.folders
        .create$(homeFolderId, { name: folderName })
        .pipe(raiseHTTPErrors())
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
    assetsGtw.assetsDeprecated.story
        .create$(homeFolderId, {
            title: 'test-story',
        })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: Asset) => {
            expectAttributes(resp, ['assetId', 'rawId', 'treeId'])
            storyTreeId = resp.treeId
            storyAssetId = resp.assetId
            expect(resp.name).toBe('test-story')
            done()
        })
})

test('assetsGtw.explorerDeprecated.items.get$', (done) => {
    assetsGtw.explorerDeprecated.items
        .get$(storyTreeId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: ItemResponse) => {
            expectAttributes(resp, ['assetId', 'rawId', 'treeId'])
            expect(resp.name).toBe('test-story')
            done()
        })
})

test('assetsGtw.explorerDeprecated.getPermissions$', (done) => {
    assetsGtw.explorerDeprecated
        .getPermissions$(storyTreeId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: PermissionsResponse) => {
            expect(resp.read).toBeTruthy()
            expect(resp.write).toBeTruthy()
            expect(resp.share).toBeTruthy()

            done()
        })
})

test('assetsGtw.explorerDeprecated.items.borrowItem$', (done) => {
    assetsGtw.explorerDeprecated
        .borrowItem$(storyTreeId, { destinationFolderId: workingFolderId })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: ItemResponse) => {
            expectAttributes(resp, ['assetId', 'rawId', 'treeId'])
            expect(resp.name).toBe('test-story')
            expect(resp.borrowed).toBeTruthy()
            done()
        })
})

test('assetsGtw.explorerDeprecated.move$', (done) => {
    assetsGtw.explorerDeprecated
        .move$(storyTreeId, { destinationFolderId: workingFolderId })
        .pipe(raiseHTTPErrors())
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

test('assetsGtw.explorerDeprecated.items.delete$', (done) => {
    assetsGtw.explorerDeprecated.items
        .delete$(storyTreeId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp).toEqual({})
            done()
        })
})

test('assetsGtw.explorerDeprecated.folders.rename$', (done) => {
    const folderName = 'test folder renamed'
    assetsGtw.explorerDeprecated.folders
        .rename$(homeFolderId, { name: folderName })
        .pipe(raiseHTTPErrors())
        .subscribe((resp: FolderResponse) => {
            expect(resp.folderId).toBe(homeFolderId)
            expect(resp.name).toEqual(folderName)
            done()
        })
})

test('assetsGtw.explorerDeprecated.folders.queryChildren$', (done) => {
    assetsGtw.explorerDeprecated.folders
        .queryChildren$(homeFolderId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.folders).toHaveLength(1)
            expect(resp.items).toHaveLength(0)
            expect(resp.folders[0].folderId).toEqual(workingFolderId)
            done()
        })
})

test('assetsGtw.explorerDeprecated.folders.delete$', (done) => {
    assetsGtw.explorerDeprecated.folders
        .delete$(workingFolderId)
        .pipe(
            raiseHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.explorerDeprecated.folders.queryChildren$(
                    homeFolderId,
                )
            }),
        )
        .subscribe((resp: ChildrenFolderResponse) => {
            expect(resp.folders).toHaveLength(0)
            expect(resp.items).toHaveLength(0)
            done()
        })
})

test('assetsGtw.explorerDeprecated.drives.queryDeletedItems$', (done) => {
    assetsGtw.explorerDeprecated.drives
        .queryDeletedItems$(defaultDriveId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp: DeletedResponse) => {
            expect(resp.items).toHaveLength(1)
            expect(resp.folders).toHaveLength(1)
            done()
        })
})

test('assetsGtw.explorerDeprecated.drives.purge$', (done) => {
    assetsGtw.explorerDeprecated.drives
        .purge$(defaultDriveId)
        .pipe(raiseHTTPErrors())
        .subscribe((resp) => {
            expect(resp.foldersCount).toBe(1)
            done()
        })
})

test('assetsGtw.explorerDeprecated.drives.delete$', (done) => {
    assetsGtw.explorerDeprecated.drives
        .delete$(newDriveId)
        .pipe(
            raiseHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.explorerDeprecated.groups.queryDrives$(
                    privateGrpId,
                )
            }),
        )
        .subscribe((resp: DrivesResponse) => {
            expect(resp.drives.find((d) => d.driveId == newDriveId)).toBeFalsy()
            done()
        })
})
