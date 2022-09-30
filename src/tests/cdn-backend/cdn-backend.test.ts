// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import path from 'path'
import { expectAttributes, shell$ } from '../common'
import '../mock-requests'
import {
    getPackageFolderContent,
    getInfo,
    getResource,
    uploadPackage,
    downloadPackage,
    deleteLibrary,
    getVersionInfo,
    getEntryPoint,
} from './shell'
import { tap } from 'rxjs/operators'
import { readFileSync } from 'fs'
import { onHTTPErrors } from '../../lib'
import { GetAssetResponse } from '../../lib/assets-backend'
import { GetLibraryInfoResponse } from '../../lib/cdn-backend'
import { setup$ } from '../py-youwol'

beforeAll(async (done) => {
    setup$({
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

class TestData {
    public readonly asset?: GetAssetResponse
    public readonly metadata?: GetLibraryInfoResponse
    public readonly downloaded?: Blob

    constructor(params: {
        asset?: GetAssetResponse
        metadata?: GetLibraryInfoResponse
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
                (shell, resp) =>
                    new TestData({ ...shell.context, asset: resp }),
            ),
            getEntryPoint(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                    version: '0.0.1-wip',
                }),
                (shell, resp) => {
                    expect(resp.includes('<!doctype html>')).toBeTruthy()
                    return shell.context
                },
            ),
            getResource(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                    version: '0.0.1-wip',
                    restOfPath: 'package.json',
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
                    return shell.context
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
                (shell, resp) =>
                    new TestData({ ...shell.context, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.context.asset.rawId }),
                (shell, resp) => {
                    expect(resp.versions).toEqual(['0.0.1-wip'])
                    return new TestData({ ...shell.context, metadata: resp })
                },
            ),
            getVersionInfo(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                    version: shell.context.metadata.versions[0],
                }),
                (shell, resp) => {
                    expect(resp.version).toBe('0.0.1-wip')
                    return shell.context
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
                (shell, resp) =>
                    new TestData({ ...shell.context, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.context.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.context, metadata: resp }),
            ),
            getPackageFolderContent(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                    restOfPath: '',
                    version: shell.context.metadata.versions[0],
                }),
                (shell, resp) => {
                    expectAttributes(resp, ['files', 'folders', 'size'])
                    expect(resp.files).toHaveLength(5)
                    expect(resp.folders).toHaveLength(1)
                    expectAttributes(resp.folders[0], ['name', 'path', 'size'])
                    return shell.context
                },
            ),
            getPackageFolderContent(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                    restOfPath: 'assets',
                    version: shell.context.metadata.versions[0],
                }),
                (shell, resp) => {
                    expect(resp.files).toHaveLength(0)
                    expect(resp.folders).toHaveLength(1)
                    expect(resp.folders[0].path).toBe('assets/styles')
                    return shell.context
                },
            ),
            getPackageFolderContent(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                    restOfPath: 'assets/styles',
                    version: shell.context.metadata.versions[0],
                }),
                (shell, resp) => {
                    expect(resp.files).toHaveLength(1)
                    expect(resp.folders).toHaveLength(0)
                    expect(resp.files[0].name).toBe('style.css')
                    expect(resp.files[0].encoding).toBe('br')
                    expect(resp.files[0].size).toBeGreaterThan(0)
                    return shell.context
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
                (shell, resp) =>
                    new TestData({ ...shell.context, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.context.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.context, metadata: resp }),
            ),
            downloadPackage(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                    version: shell.context.metadata.versions[0],
                }),
                (shell, resp) =>
                    new TestData({ ...shell.context, downloaded: resp }),
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
                fileReader.readAsArrayBuffer(shell.context.downloaded)
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
                (shell, resp) =>
                    new TestData({ ...shell.context, asset: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.context.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.context, metadata: resp }),
            ),
            deleteLibrary(
                (shell) => ({
                    libraryId: shell.context.asset.rawId,
                }),
                (shell, resp) =>
                    new TestData({ ...shell.context, downloaded: resp }),
            ),
            getInfo(
                (shell) => ({ libraryId: shell.context.asset.rawId }),
                (shell) => {
                    expect(false).toBeTruthy()
                    return shell.context
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
