import './mock-requests'
import {
    AccessInfo,
    Asset,
    AssetsGatewayClient,
    DefaultDriveResponse, ExposingGroup,
    GroupsResponse,
    HealthzResponse, UserInfoResponse
} from '../lib/assets-gateway'
import {expectAttributes, resetPyYouwolDbs$} from './common'


let assetsGtw = new AssetsGatewayClient()


beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

let privateGrpPath = "private"
let privateGrpId: string
let homeFolderId: string

test('assetsGtw.getHealthz$', (done) => {

    assetsGtw.getHealthz$().subscribe((resp: HealthzResponse) => {
        expect(resp.status).toEqual('assets-gateway ok')
        done()
    })
})

test('assetsGtw.getUserInfo$', (done) => {

    assetsGtw.getUserInfo$().subscribe((resp: UserInfoResponse) => {
        expectAttributes(resp, ['name', 'groups'])
        done()
    })
})

test('assetsGtw.queryGroups$', (done) => {

    assetsGtw.queryGroups()
        .subscribe((resp: GroupsResponse) => {
            let privateGrp = resp.groups.find(g => g.path == privateGrpPath)
            expect(privateGrp).toBeTruthy()
            privateGrpId = privateGrp.id
            done()
        })
})

test('assetsGtw.explorer.groups.getDefaultDrive$', (done) => {

    assetsGtw.explorer.groups.getDefaultDrive$(privateGrpId)
        .subscribe((resp: DefaultDriveResponse) => {

            homeFolderId = resp.homeFolderId
            done()
        })
})

test('assetsGtw.assets.fluxProject.create$', (done) => {

    assetsGtw.assets.fluxProject.create$(
        homeFolderId,
        {
            name: "test",
            description: "platform-essentials integration test"
        })
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
            expect(resp.name).toEqual("test")
            expect(resp.description).toEqual("platform-essentials integration test")
            done()
        })
})

let storyAssetId = undefined

test('assetsGtw.assets.story.create$', (done) => {

    assetsGtw.assets.story.create$(
        homeFolderId,
        {
            title: "test-story"
        })
        .subscribe((resp: Asset) => {
            expectAttributes(resp, [
                'assetId',
                'rawId',
                'treeId',
                //'description',
                'name',
                'kind',
                'groupId',
                'images',
                'thumbnails',
                'tags',
                //'permissions'
            ])
            storyAssetId = resp.assetId
            expect(resp.name).toEqual("test-story")
            done()
        })
})

test('assetsGtw.assets.get$', (done) => {

    assetsGtw.assets.get$(storyAssetId)
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
                'permissions'
            ])
            expect(resp.name).toEqual("test-story")
            done()
        })
})


test('assetsGtw.assets.getAccess$', (done) => {

    assetsGtw.assets.getAccess$(storyAssetId)
        .subscribe((resp: AccessInfo) => {
            expectAttributes(resp, [
                'owningGroup',
                'ownerInfo',
                'consumerInfo'
            ])
            expect(resp.consumerInfo.permissions)
                .toEqual({write: true, read:true, share:true, expiration:null})
            expect(resp.ownerInfo.exposingGroups).toEqual([])
            expect(resp.ownerInfo.defaultAccess)
                .toEqual({read: 'forbidden', share:'forbidden', expiration:null})
            done()
        })
})


test('assetsGtw.assets.updateAccess$', (done) => {

    let groupId = btoa('/youwol-users')
    assetsGtw.assets.updateAccess$(storyAssetId, groupId, {read:'authorized', share:'authorized'})
        .subscribe((resp: ExposingGroup) => {
            expectAttributes(resp, [
                'name',
                'groupId',
                'access'
            ])
            expect(resp.access).toEqual({read:'authorized', share:'authorized', expiration:null})
            done()
        })
})

test('assetsGtw.assets.update$', (done) => {

    assetsGtw.assets.update$(storyAssetId, {name:'renamed story', tags:['story'], 'description':'update asset'})
        .subscribe((resp: Asset) => {
            expectAttributes(resp, [
                'assetId',
                'rawId'
            ])
            done()
        })
})
