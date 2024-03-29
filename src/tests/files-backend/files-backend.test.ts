import path from 'path'

import { getPyYouwolBasePath, shell$ } from '../common'
import '../mock-requests'
import { get, getInfo, remove, updateMetadata, upload } from './shell'
import { readFileSync } from 'fs'
import { firstValueFrom, from } from 'rxjs'
import { mapTo, mergeMap, reduce, take, tap } from 'rxjs/operators'
import { GetInfoResponse, UploadResponse } from '../../lib/files-backend'
import { GetAssetResponse } from '../../lib/assets-backend'
import { LocalYouwol } from '@youwol/http-primitives'
import { NewAssetResponse } from '../../lib/assets-gateway'
import { purgeDrive, trashItem } from '../treedb-backend'
import { getAsset } from '../assets-backend'

beforeAll(async () => {
    await firstValueFrom(
        LocalYouwol.setup$({
            localOnly: true,
            authId: 'int_tests_yw-users@test-user',
        }),
    )
})

class TestData {
    public readonly fileName?: string
    public readonly asset?: NewAssetResponse<UploadResponse>
    public readonly metadata?: GetInfoResponse
    public readonly downloaded?: Blob
    public readonly thumbnailUrl?: string

    constructor(params: {
        asset?: GetAssetResponse
        metadata?: GetInfoResponse
        downloaded?: Blob
        fileName?: string
        thumbnailUrl?: string
    }) {
        Object.assign(this, params)
    }
}

test('upload files, get stats & get content', async () => {
    const testDataDir = __dirname + '/test-data'

    const expectedContentTypes = {
        'logo_YouWol_2020.png': 'image/png',
        'package.json': 'application/json',
        'text.txt': 'text/plain',
        'text.txt.br': 'text/plain',
    }
    const expectedContentEncodings = {
        'logo_YouWol_2020.png': 'identity',
        'package.json': 'identity',
        'text.txt': 'identity',
        'text.txt.br': 'br',
    }
    const inputs = [
        'logo_YouWol_2020.png',
        'package.json',
        'text.txt',
        'text.txt.br',
    ]
    const test$ = from(inputs).pipe(
        mergeMap((file) => {
            return shell$<TestData>({ fileName: file })
        }),
        upload<TestData>({
            inputs: (shell) => ({
                body: {
                    fileName: shell.context.fileName,
                    fileId: shell.context.fileName,
                    path: path.resolve(testDataDir, shell.context.fileName),
                },
                queryParameters: { folderId: shell.homeFolderId },
            }),
            sideEffects: (resp, shell) => {
                expect(resp.name).toBe(shell.context.fileName)
                expect(resp.rawResponse.fileName).toBe(shell.context.fileName)
                expect(resp.rawResponse.contentType).toBe(
                    expectedContentTypes[resp.name],
                )
                expect(resp.rawResponse.contentEncoding).toBe(
                    expectedContentEncodings[resp.name],
                )
            },
            newContext: (shell, resp: NewAssetResponse<UploadResponse>) => {
                return new TestData({
                    ...shell.context,
                    asset: resp,
                    thumbnailUrl: resp.images[0],
                })
            },
        }),
        getInfo({
            inputs: (shell) => ({ fileId: shell.context.asset.rawId }),
            sideEffects: (resp, shell) => {
                expect(resp.metadata.contentType).toBe(
                    expectedContentTypes[shell.context.fileName],
                )
                expect(resp.metadata.contentEncoding).toBe(
                    expectedContentEncodings[shell.context.fileName],
                )
            },
        }),
        get({
            inputs: (shell) => {
                return { fileId: shell.context.asset.rawId }
            },
            newContext: (shell, resp) =>
                new TestData({ ...shell.context, downloaded: resp }),
        }),
        mergeMap((shell) => {
            const promise = new Promise((resolve) => {
                const fileReader = new FileReader()
                fileReader.onload = function (event) {
                    const original = readFileSync(
                        path.resolve(testDataDir, shell.context.fileName),
                    )
                    const downloaded = new Uint8Array(
                        event.target.result as ArrayBuffer,
                    )
                    if (!shell.context.fileName.endsWith('.br')) {
                        // there is auto brotli decompression activated in unit tests
                        // eslint-disable-next-line jest/no-conditional-expect -- seems appropriated here
                        expect(original).toHaveLength(downloaded.length)
                    }
                    resolve(shell)
                }
                fileReader.readAsArrayBuffer(shell.context.downloaded)
            })
            return from(promise)
        }),
        take(inputs.length),
        reduce((acc, e) => [...acc, e], []),
    )
    await firstValueFrom(test$)
})

test('upload image file, check thumbnails & delete', async () => {
    const testDataDir = __dirname + '/test-data'

    const test$ = shell$<TestData>({ fileName: 'logo_YouWol_2020.png' }).pipe(
        upload<TestData>({
            inputs: (shell) => ({
                body: {
                    fileName: shell.context.fileName,
                    fileId: shell.context.fileName,
                    path: path.resolve(testDataDir, shell.context.fileName),
                },
                queryParameters: { folderId: shell.homeFolderId },
            }),
            sideEffects: (resp) => {
                expect(resp.images).toHaveLength(1)
            },
            newContext: (shell, resp: NewAssetResponse<UploadResponse>) => {
                return new TestData({
                    ...shell.context,
                    asset: resp,
                    thumbnailUrl: resp.images[0],
                })
            },
        }),
        mergeMap((shell) => {
            const request = new Request(
                `${getPyYouwolBasePath()}${shell.context.thumbnailUrl}`,
            )
            return from(fetch(request)).pipe(
                mergeMap((data) => {
                    return from(data.blob())
                }),
                tap((blob) => {
                    expect(blob.type).toBe('image/png')
                    expect(blob.size).toBe(2303)
                }),
                mapTo(shell),
            )
        }),
        remove(
            (shell) => ({
                fileId: shell.context.asset.rawId,
            }),
            (shell) => {
                return shell.context
            },
        ),
        getInfo({
            inputs: (shell) => ({ fileId: shell.context.asset.rawId }),
            authorizedErrors: (resp) => resp.status == 404,
        }),
    )
    await firstValueFrom(test$)
})

test('upload file, update metadata', async () => {
    const testDataDir = __dirname + '/test-data'

    const test$ = shell$<TestData>({ fileName: 'package.json' }).pipe(
        upload<TestData>({
            inputs: (shell) => ({
                body: {
                    fileName: shell.context.fileName,
                    fileId: shell.context.fileName,
                    path: path.resolve(testDataDir, shell.context.fileName),
                },
                queryParameters: { folderId: shell.homeFolderId },
            }),
            newContext: (shell, resp: NewAssetResponse<UploadResponse>) => {
                return new TestData({
                    ...shell.context,
                    asset: resp,
                })
            },
        }),
        updateMetadata(
            (shell) => ({
                fileId: shell.context.asset.rawId,
                metadata: {
                    contentType: 'tutu',
                    contentEncoding: 'tata',
                },
            }),
            (shell) => {
                return shell.context
            },
        ),
        getInfo({
            inputs: (shell) => ({ fileId: shell.context.asset.rawId }),
            sideEffects: (resp, shell) => {
                expect(resp.metadata.fileName).toBe(shell.context.asset.name)
                expect(resp.metadata.contentType).toBe('tutu')
                expect(resp.metadata.contentEncoding).toBe('tata')
            },
        }),
    )
    await firstValueFrom(test$)
})

test('upload data, delete from explorer (purge)', async () => {
    const testDataDir = __dirname + '/test-data'

    const test$ = shell$<TestData>({ fileName: 'package.json' }).pipe(
        upload<TestData>({
            inputs: (shell) => ({
                body: {
                    fileName: shell.context.fileName,
                    fileId: shell.context.fileName,
                    path: path.resolve(testDataDir, shell.context.fileName),
                },
                queryParameters: { folderId: shell.homeFolderId },
            }),
            newContext: (shell, resp: NewAssetResponse<UploadResponse>) => {
                return new TestData({
                    ...shell.context,
                    asset: resp,
                })
            },
        }),
        trashItem({
            inputs: (shell) => ({ itemId: shell.context.asset.itemId }),
        }),
        purgeDrive({
            inputs: (shell) => ({ driveId: shell.defaultDriveId }),
        }),
        get({
            inputs: (shell) => {
                return { fileId: shell.context.asset.rawId }
            },
            authorizedErrors: (resp) => resp.status == 404,
        }),
        getAsset({
            inputs: (shell) => ({ assetId: shell.context.asset.assetId }),
            authorizedErrors: (resp) => {
                expect(resp.status).toBe(404)
                return true
            },
        }),
    )
    await firstValueFrom(test$)
})
