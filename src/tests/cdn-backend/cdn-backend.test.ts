// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import path from 'path'
import { Asset, MetadataResponse } from '../../lib/assets-gateway'
import { expectAttributes, resetPyYouwolDbs$ } from '../common'
import '../mock-requests'
import {
    getPackageFolderContent,
    getInfo,
    getResource,
    shell$,
    uploadPackage,
    downloadPackage,
    deleteLibrary,
    getVersionInfo,
    getEntryPoint,
} from './shell'
import { tap } from 'rxjs/operators'
import { readFileSync } from 'fs'
import { onHTTPErrors } from '../../lib'

jest.setTimeout(90 * 1000)

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

class TestData {
    public readonly asset?: Asset
    public readonly metadata?: MetadataResponse
    public readonly downloaded?: Blob

    constructor(params: {
        asset?: Asset
        metadata?: MetadataResponse
        downloaded?: Blob
    }) {
        Object.assign(this, params)
    }
}

test('get resource', (done) => {
    shell$<TestData>()
        .pipe(
            uploadPackage(
                path.resolve(__dirname, './cdn.zip'),
                (shell, resp) => new TestData({ ...shell.data, asset: resp }),
            ),
            getEntryPoint(
                (shell) => ({
                    libraryId: shell.data.asset.rawId,
                    version: '0.0.1-wip',
                }),
                (shell, resp) => {
                    expect(resp.includes('<!doctype html>')).toBeTruthy()
                    return shell.data
                },
            ),
            getResource(
                (shell) => ({
                    libraryId: shell.data.asset.rawId,
                    version: '0.0.1-wip',
                    path: 'package.json',
                }),
                (shell, resp) => {
                    expectAttributes(resp, [
                        'name',
                        'version',
                        'main',
                        'scripts',
                    ])
                    expect(resp['name']).toBe('@youwol/todo-app-js')
                    expect(resp['version']).toBe('0.0.1-wip')
                    return shell.data
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('get info', (done) => {
    shell$<TestData>()
        .pipe(
            uploadPackage(
                path.resolve(__dirname, './cdn.zip'),
                (shell, resp) => new TestData({ ...shell.data, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.data.asset.rawId }),
                (shell, resp) => {
                    expect(resp.versions).toEqual(['0.0.1-wip'])
                    return new TestData({ ...shell.data, metadata: resp })
                },
            ),
            getVersionInfo(
                (shell) => ({
                    libraryId: shell.data.asset.rawId,
                    version: shell.data.metadata.versions[0],
                }),
                (shell, resp) => {
                    expect(resp.version).toEqual('0.0.1-wip')
                    return shell.data
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('get explorer', (done) => {
    shell$<TestData>()
        .pipe(
            uploadPackage(
                path.resolve(__dirname, './cdn.zip'),
                (shell, resp) => new TestData({ ...shell.data, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.data.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.data, metadata: resp }),
            ),
            getPackageFolderContent(
                (shell) => ({
                    rawId: shell.data.asset.rawId,
                    path: '',
                    version: shell.data.metadata.versions[0],
                }),
                (shell, resp) => {
                    expectAttributes(resp, ['files', 'folders', 'size'])
                    expect(resp.files.length).toBe(5)
                    expect(resp.folders.length).toBe(1)
                    expectAttributes(resp.folders[0], ['name', 'path', 'size'])
                    return shell.data
                },
            ),
            getPackageFolderContent(
                (shell) => ({
                    rawId: shell.data.asset.rawId,
                    path: 'assets',
                    version: shell.data.metadata.versions[0],
                }),
                (shell, resp) => {
                    expect(resp.files.length).toBe(0)
                    expect(resp.folders.length).toBe(1)
                    expect(resp.folders[0].path).toBe('assets/styles')
                    return shell.data
                },
            ),
            getPackageFolderContent(
                (shell) => ({
                    rawId: shell.data.asset.rawId,
                    path: 'assets/styles',
                    version: shell.data.metadata.versions[0],
                }),
                (shell, resp) => {
                    expect(resp.files.length).toBe(1)
                    expect(resp.folders.length).toBe(0)
                    expect(resp.files[0].name).toBe('style.css')
                    expect(resp.files[0].encoding).toBe('br')
                    expect(resp.files[0].size).toBeGreaterThan(0)
                    return shell.data
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('download package', (done) => {
    shell$<TestData>()
        .pipe(
            uploadPackage(
                path.resolve(__dirname, './cdn.zip'),
                (shell, resp) => new TestData({ ...shell.data, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.data.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.data, metadata: resp }),
            ),
            downloadPackage(
                (shell) => ({
                    libraryId: shell.data.asset.rawId,
                    version: shell.data.metadata.versions[0],
                }),
                (shell, resp) =>
                    new TestData({ ...shell.data, downloaded: resp }),
            ),
            tap((shell) => {
                const fileReader = new FileReader()
                fileReader.onload = function (event) {
                    const original = readFileSync(
                        path.resolve(__dirname, './cdn.zip'),
                    )
                    const downloaded = new Uint8Array(
                        event.target.result as ArrayBuffer,
                    )
                    expect(original).toEqual(downloaded)
                    //fs.writeFileSync(path.resolve(__dirname, './result.zip'), downloaded)
                }
                fileReader.readAsArrayBuffer(shell.data.downloaded)
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('delete package', (done) => {
    shell$<TestData>()
        .pipe(
            uploadPackage(
                path.resolve(__dirname, './cdn.zip'),
                (shell, resp) => new TestData({ ...shell.data, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.data.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.data, metadata: resp }),
            ),
            deleteLibrary(
                (shell) => ({
                    libraryId: shell.data.asset.rawId,
                }),
                (shell, resp) =>
                    new TestData({ ...shell.data, downloaded: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.data.asset.rawId }),
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
