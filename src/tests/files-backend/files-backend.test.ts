// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import path from 'path'
import { Asset, MetadataResponse } from '../../lib/assets-gateway'
import { getPyYouwolBasePath, resetPyYouwolDbs$ } from '../common'
import '../mock-requests'
import { get, getStats, remove, shell$, updateMetadata, upload } from './shell'
import { readFileSync } from 'fs'
import { from } from 'rxjs'
import { mapTo, mergeMap, reduce, take, tap } from 'rxjs/operators'
import { onHTTPErrors } from '../../lib'

jest.setTimeout(90 * 1000)
beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

class TestData {
    public readonly fileName?: string
    public readonly asset?: Asset
    public readonly metadata?: MetadataResponse
    public readonly downloaded?: Blob
    public readonly thumbnailUrl?: string

    constructor(params: {
        asset?: Asset
        metadata?: MetadataResponse
        downloaded?: Blob
        fileName?: string
        thumbnailUrl?: string
    }) {
        Object.assign(this, params)
    }
}

test('upload files, get stats & get content', (done) => {
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
    from(inputs)
        .pipe(
            mergeMap((file) => {
                return shell$<TestData>({ fileName: file })
            }),
            upload(
                (shell) => ({
                    fileName: shell.data.fileName,
                    fileId: shell.data.fileName,
                    path: path.resolve(testDataDir, shell.data.fileName),
                }),
                (shell, resp) => {
                    expect(resp.name).toBe(shell.data.fileName)
                    expect(resp.rawResponse.fileName).toBe(shell.data.fileName)
                    expect(resp.rawResponse.contentType).toBe(
                        expectedContentTypes[resp.name],
                    )
                    expect(resp.rawResponse.contentEncoding).toBe(
                        expectedContentEncodings[resp.name],
                    )
                    return new TestData({ ...shell.data, asset: resp })
                },
            ),
            getStats(
                (shell) => ({ fileId: shell.data.asset.rawId }),
                (shell, resp) => {
                    expect(resp.metadata.contentType).toBe(
                        expectedContentTypes[shell.data.fileName],
                    )
                    expect(resp.metadata.contentEncoding).toBe(
                        expectedContentEncodings[shell.data.fileName],
                    )
                    return new TestData(shell.data)
                },
            ),
            get(
                (shell) => ({ fileId: shell.data.asset.rawId }),
                (shell, resp: Blob) => {
                    return new TestData({ ...shell.data, downloaded: resp })
                },
            ),
            mergeMap((shell) => {
                const promise = new Promise((resolve) => {
                    const fileReader = new FileReader()
                    fileReader.onload = function (event) {
                        const original = readFileSync(
                            path.resolve(testDataDir, shell.data.fileName),
                        )
                        const downloaded = new Uint8Array(
                            event.target.result as ArrayBuffer,
                        )
                        if (!shell.data.fileName.endsWith('.br')) {
                            // there is auto brotli decompression activated in unit tests
                            expect(original).toHaveLength(downloaded.length)
                        }
                        resolve(shell)
                    }
                    fileReader.readAsArrayBuffer(shell.data.downloaded)
                })
                return from(promise)
            }),
            take(inputs.length),
            reduce((acc, e) => [...acc, e], []),
        )
        .subscribe(() => {
            done()
        })
})

test('upload image file, check thumbnails & delete', (done) => {
    const testDataDir = __dirname + '/test-data'

    shell$<TestData>({ fileName: 'logo_YouWol_2020.png' })
        .pipe(
            upload(
                (shell) => ({
                    fileName: shell.data.fileName,
                    fileId: shell.data.fileName,
                    path: path.resolve(testDataDir, shell.data.fileName),
                }),
                (shell, resp) => {
                    expect(resp.images).toHaveLength(1)
                    return new TestData({
                        ...shell.data,
                        asset: resp,
                        thumbnailUrl: resp.images[0],
                    })
                },
            ),
            mergeMap((shell) => {
                const request = new Request(
                    `${getPyYouwolBasePath()}${shell.data.thumbnailUrl}`,
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
                    fileId: shell.data.asset.rawId,
                }),
                (shell) => {
                    return shell.data
                },
            ),
            getStats(
                (shell) => ({ fileId: shell.data.asset.rawId }),
                (shell) => {
                    expect(false).toBeTruthy()
                    return shell.data
                },
                onHTTPErrors((resp) => {
                    expect(resp.status).toBe(404)
                    return 'ManagedError'
                }),
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('upload file, update metadata', (done) => {
    const testDataDir = __dirname + '/test-data'

    shell$<TestData>({ fileName: 'package.json' })
        .pipe(
            upload(
                (shell) => ({
                    fileName: shell.data.fileName,
                    fileId: shell.data.fileName,
                    path: path.resolve(testDataDir, shell.data.fileName),
                }),
                (shell, resp) => {
                    return new TestData({
                        ...shell.data,
                        asset: resp,
                    })
                },
            ),
            updateMetadata(
                (shell) => ({
                    fileId: shell.data.asset.rawId,
                    metadata: {
                        contentType: 'tutu',
                        contentEncoding: 'tata',
                    },
                }),
                (shell) => {
                    return shell.data
                },
            ),
            getStats(
                (shell) => ({ fileId: shell.data.asset.rawId }),
                (shell, resp) => {
                    expect(resp.metadata.fileName).toBe(shell.data.asset.name)
                    expect(resp.metadata.contentType).toBe('tutu')
                    expect(resp.metadata.contentEncoding).toBe('tata')
                    return shell.data
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})
