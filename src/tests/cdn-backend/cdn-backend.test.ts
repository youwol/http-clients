// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import path from 'path'
import { Asset, MetadataResponse } from '../../lib/assets-gateway'
import {
    expectAssetAttributes,
    expectAttributes,
    resetPyYouwolDbs$,
} from '../common'
import '../mock-requests'
import {
    getPackageFolderContent,
    getRawMetadata,
    getResource,
    shell$,
    uploadPackage,
} from './shell'
import { tap } from 'rxjs/operators'

jest.setTimeout(90 * 1000)

beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

class TestData {
    public readonly asset?: Asset
    public readonly metadata?: MetadataResponse

    constructor(params: { asset?: Asset; metadata?: MetadataResponse }) {
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
            tap((shell) => {
                expectAssetAttributes(shell.data.asset)
            }),
            getResource(
                (shell) => ({
                    rawId: shell.data.asset.rawId,
                    path: '0.0.1-wip/package.json',
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

test('get metadata', (done) => {
    shell$<TestData>()
        .pipe(
            uploadPackage(
                path.resolve(__dirname, './cdn.zip'),
                (shell, resp) => new TestData({ ...shell.data, asset: resp }),
            ),
            tap((shell) => {
                expectAssetAttributes(shell.data.asset)
            }),
            getRawMetadata(
                (shell) => ({ rawId: shell.data.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.data, metadata: resp }),
            ),
            tap((shell) => {
                expectAttributes(shell.data.metadata, [
                    'name',
                    'versions',
                    'namespace',
                    'id',
                    'releases',
                ])
            }),
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
            tap((shell) => {
                expectAssetAttributes(shell.data.asset)
            }),
            getRawMetadata(
                (shell) => ({ rawId: shell.data.asset.rawId }),
                (shell, resp) =>
                    new TestData({ ...shell.data, metadata: resp }),
            ),
            tap((shell) => {
                expectAttributes(shell.data.metadata, [
                    'name',
                    'versions',
                    'namespace',
                    'id',
                    'releases',
                ])
            }),
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
