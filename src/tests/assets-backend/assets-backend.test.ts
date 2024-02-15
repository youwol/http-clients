import '../mock-requests'
import { shell$ } from '../common'
import AdmZip from 'adm-zip'
import {
    accessInfo,
    addFiles,
    addImage,
    createAsset,
    deleteAccessPolicy,
    deleteAsset,
    deleteFiles,
    getAccessPolicy,
    getAsset,
    getFile,
    getMedia,
    getPermissions,
    removeImage,
    updateAsset,
    upsertAccessPolicy,
    getZipFiles,
} from './shell'
import { AssetBase, QueryAccessInfoResponse } from '../../lib/assets-backend'
import path from 'path'
import { HTTPError, LocalYouwol } from '@youwol/http-primitives'
import { writeFileSync } from 'fs'
import { firstValueFrom } from 'rxjs'

jest.setTimeout(100 * 1000)
beforeEach(async () => {
    await firstValueFrom(
        LocalYouwol.setup$({
            localOnly: true,
            authId: 'int_tests_yw-users@test-user',
        }),
    )
})

test('happy path', async () => {
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
        expect(resp.assetId).toBe(window.btoa(target.rawId))
        expect(resp.description).toBe(target.description)
        expect(resp.tags).toEqual(target.tags)
        expect(resp.groupId).toEqual(target.groupId)
    }
    const test$ = shell$<Context>(new Context()).pipe(
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
    await firstValueFrom(test$)
})

test('access-info', async () => {
    class Context {
        public readonly asset = {
            rawId: 'test-related-id',
            kind: 'test-kind',
            name: 'test asset',
            description: 'an asset for test',
            tags: ['test', 'assets-backend'],
            images: [],
            thumbnails: [],
            groupId: '',
        }
        public readonly assetId = window.btoa('test-related-id')
        public readonly publicGroup = 'L3lvdXdvbC11c2Vycw=='

        constructor(params: { asset? } = {}) {
            Object.assign(this, params)
        }
    }

    const test$ = shell$<Context>(new Context()).pipe(
        createAsset({
            inputs: (shell) => ({
                body: shell.context.asset,
            }),
        }),
        accessInfo({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
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
                assetId: shell.context.assetId,
                groupId: shell.context.publicGroup,
                body: { read: 'authorized', share: 'forbidden' },
            }),
        }),
        accessInfo({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
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
    await firstValueFrom(test$)
})

test('asset with raw-data', async () => {
    class Context {
        public readonly asset = {
            rawId: 'test-related-id',
            kind: 'test-kind',
            name: 'test asset',
            description: 'an asset for test',
            tags: ['test', 'assets-backend'],
            images: [],
            thumbnails: [],
            groupId: '',
        }
        public readonly assetId = window.btoa('test-related-id')
        public readonly publicGroup = 'L3lvdXdvbC11c2Vycw=='

        constructor(params: { asset? } = {}) {
            Object.assign(this, params)
        }
    }

    const test$ = shell$<Context>(new Context()).pipe(
        createAsset({
            inputs: (shell) => ({
                body: shell.context.asset,
            }),
        }),
        addFiles({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
                path: path.resolve(__dirname, './test-data/test-add-files.zip'),
            }),
            sideEffects: (resp) => {
                expect(resp.filesCount).toBe(2)
                expect(resp.totalBytes).toBe(42)
            },
        }),
        getFile({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
                path: './topLevelFile.json',
            }),
            sideEffects: (resp) => {
                // The path 'string' is for backward comp.: the branch 'feature/files-allow-range-bytes' fix it.
                // It was a problem of 'content-type' not properly forwarded
                const json = typeof resp == 'string' ? JSON.parse(resp) : resp
                expect(json.summary).toBe('a file at the top level')
            },
        }),
        getFile({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
                path: './innerFolder/innerFile.json',
            }),
            sideEffects: (resp) => {
                // The path 'string' is for backward comp.: the branch 'feature/files-allow-range-bytes' fix it.
                // It was a problem of 'content-type' not properly forwarded
                const json = typeof resp == 'string' ? JSON.parse(resp) : resp
                expect(json.summary).toBe('A file in a folder.')
            },
        }),
        getZipFiles({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
            }),
            sideEffects: (resp) => {
                expect(resp).toBeTruthy()
                resp.arrayBuffer().then((buffer) => {
                    const zip_path = path.resolve(
                        __dirname,
                        './test-data/result.zip',
                    )
                    writeFileSync(zip_path, Buffer.from(buffer))
                    const zipped = new AdmZip(zip_path)

                    zipped.readAsTextAsync('topLevelFile.json', (data) => {
                        expect(JSON.parse(data).summary).toBe(
                            'a file at the top level',
                        )
                    })
                    zipped.readAsTextAsync(
                        'innerFolder/innerFile.json',
                        (data) => {
                            expect(JSON.parse(data).summary).toBe(
                                'A file in a folder.',
                            )
                        },
                    )
                })
            },
        }),
        deleteFiles({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
            }),
        }),
        getFile({
            inputs: (shell) => ({
                assetId: shell.context.assetId,
                path: './topLevelFile.json',
            }),
            authorizedErrors: (resp) => {
                return resp.status == 404
            },
            sideEffects: () => {
                expect(false).toBeTruthy()
            },
        }),
    )

    await firstValueFrom(test$)
})
