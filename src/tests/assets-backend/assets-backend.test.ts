// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import '../mock-requests'
import { shell$ } from '../common'
import {
    accessInfo,
    addImage,
    createAsset,
    deleteAccessPolicy,
    deleteAsset,
    getAccessPolicy,
    getAsset,
    getMedia,
    getPermissions,
    healthz,
    removeImage,
    updateAsset,
    upsertAccessPolicy,
} from './shell'
import { AssetBase, QueryAccessInfoResponse } from '../../lib/assets-backend'
import path from 'path'
import { HTTPError } from '../../lib'
import { setup$ } from '../py-youwol/utils'

beforeEach(async (done) => {
    setup$({
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

test('healthz', (done) => {
    class Context {}

    shell$<Context>()
        .pipe(healthz())
        .subscribe(() => {
            done()
        })
})

test('happy path', (done) => {
    class Context {
        public readonly asset = {
            assetId: 'test-asset-id',
            rawId: 'test-related-id',
            kind: 'test-kind',
            name: 'test asset',
            description: 'an asset for test',
            tags: ['test', 'assets-backend'],
            images: [],
            thumbnails: [],
            groupId: '',
        }
        public readonly newName = 'test asset renamed'
        public readonly publicGroup = 'L3lvdXdvbC11c2Vycw=='
        constructor(params: { asset? } = {}) {
            Object.assign(this, params)
        }
    }
    function expectAsset(resp: AssetBase, target: AssetBase) {
        expect(resp.name).toBe(target.name)
        expect(resp.rawId).toBe(target.rawId)
        expect(resp.assetId).toBe(target.assetId)
        expect(resp.description).toBe(target.description)
        expect(resp.tags).toEqual(target.tags)
        expect(resp.groupId).toEqual(target.groupId)
    }
    shell$<Context>(new Context())
        .pipe(
            createAsset({
                inputs: (shell) => ({
                    body: shell.context.asset,
                }),
                sideEffects: (resp, shell) => {
                    expectAsset(resp, {
                        ...shell.context.asset,
                        groupId: shell.privateGroupId,
                    })
                },
                newContext: (shell, resp) => {
                    return new Context({ ...shell.context, asset: resp })
                },
            }),
            updateAsset({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    body: { name: shell.context.newName },
                }),
                sideEffects: (resp, shell) => {
                    expectAsset(resp, {
                        ...shell.context.asset,
                        name: shell.context.newName,
                    })
                },
                newContext: (shell, resp) => {
                    return new Context({ ...shell.context, asset: resp })
                },
            }),
            getAsset({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                sideEffects: (resp, shell) => {
                    expectAsset(resp, shell.context.asset)
                },
            }),
            upsertAccessPolicy({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    groupId: shell.context.publicGroup,
                    body: { read: 'authorized', share: 'forbidden' },
                }),
            }),
            getAccessPolicy({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    groupId: shell.context.publicGroup,
                }),
                sideEffects: (resp) => {
                    expect(resp.read).toBe('authorized')
                    expect(resp.share).toBe('forbidden')
                },
            }),
            deleteAccessPolicy({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    groupId: shell.context.publicGroup,
                }),
            }),
            getAccessPolicy({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    groupId: shell.context.publicGroup,
                }),
                sideEffects: (resp) => {
                    expect(resp.read).toBe('forbidden')
                    expect(resp.share).toBe('forbidden')
                },
            }),
            getPermissions({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                sideEffects: (resp) => {
                    expect(resp.read).toBeTruthy()
                    expect(resp.write).toBeTruthy()
                    expect(resp.share).toBeTruthy()
                    expect(resp.expiration).toBeFalsy()
                },
            }),
            addImage({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    path: path.resolve(
                        __dirname,
                        './test-data/logo_YouWol_2020.png',
                    ),
                    filename: 'logo_YouWol_2020.png',
                }),
                sideEffects: (resp) => {
                    expect(resp).toBeTruthy()
                },
            }),
            getAsset<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                sideEffects: (resp) => {
                    expect(resp.images).toHaveLength(1)
                    expect(resp.thumbnails).toHaveLength(1)
                },
                newContext: (shell, resp) => {
                    return new Context({ ...shell.context, asset: resp })
                },
            }),
            getMedia<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    mediaType: 'images',
                    filename: 'logo_YouWol_2020.png',
                }),
            }),
            getMedia<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    mediaType: 'thumbnails',
                    filename: 'logo_YouWol_2020.png',
                }),
            }),
            removeImage<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    filename: 'logo_YouWol_2020.png',
                }),
                sideEffects: (resp) => {
                    expect(resp).toBeTruthy()
                },
            }),
            getAsset<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                sideEffects: (resp) => {
                    expect(resp.images).toHaveLength(0)
                    expect(resp.thumbnails).toHaveLength(0)
                },
                newContext: (shell, resp) => {
                    return new Context({ ...shell.context, asset: resp })
                },
            }),
            getMedia<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    mediaType: 'images',
                    filename: 'logo_YouWol_2020.png',
                }),
                authorizedErrors: (resp: HTTPError) => {
                    return resp.status == 404
                },
                sideEffects: () => {
                    expect(true).toBeFalsy()
                },
            }),
            getMedia<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    mediaType: 'thumbnails',
                    filename: 'logo_YouWol_2020.png',
                }),
                authorizedErrors: (resp: HTTPError) => {
                    return resp.status == 404
                },
                sideEffects: () => {
                    expect(true).toBeFalsy()
                },
            }),
            deleteAsset<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                sideEffects: (resp) => {
                    expect(resp).toBeTruthy()
                },
            }),
            getAsset<Context>({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                authorizedErrors: (resp: HTTPError) => {
                    return resp.status == 404
                },
                sideEffects: () => {
                    expect(true).toBeFalsy()
                },
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('access-info', (done) => {
    class Context {
        public readonly asset = {
            assetId: 'test-asset-id',
            rawId: 'test-related-id',
            kind: 'test-kind',
            name: 'test asset',
            description: 'an asset for test',
            tags: ['test', 'assets-backend'],
            images: [],
            thumbnails: [],
            groupId: '',
        }
        public readonly publicGroup = 'L3lvdXdvbC11c2Vycw=='

        constructor(params: { asset? } = {}) {
            Object.assign(this, params)
        }
    }

    shell$<Context>(new Context())
        .pipe(
            createAsset({
                inputs: (shell) => ({
                    body: shell.context.asset,
                }),
            }),
            accessInfo({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                sideEffects: (resp: QueryAccessInfoResponse) => {
                    expect(resp.owningGroup.name).toBe('private')
                    expect(resp.ownerInfo.exposingGroups).toHaveLength(0)
                    expect(resp.ownerInfo.defaultAccess.read).toBe('forbidden')
                    expect(resp.ownerInfo.defaultAccess.share).toBe('forbidden')
                    expect(resp.consumerInfo.permissions).toEqual({
                        write: true,
                        read: true,
                        share: true,
                        expiration: null,
                    })
                },
            }),
            upsertAccessPolicy({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                    groupId: shell.context.publicGroup,
                    body: { read: 'authorized', share: 'forbidden' },
                }),
            }),
            accessInfo({
                inputs: (shell) => ({
                    assetId: shell.context.asset.assetId,
                }),
                sideEffects: (resp: QueryAccessInfoResponse) => {
                    expect(resp.ownerInfo.exposingGroups).toHaveLength(1)
                    expect(resp.ownerInfo.exposingGroups[0].name).toBe(
                        '/youwol-users',
                    )
                    expect(resp.ownerInfo.exposingGroups[0].access).toEqual({
                        share: 'forbidden',
                        read: 'authorized',
                        expiration: null,
                    })
                },
            }),
        )
        .subscribe(() => done())
})
