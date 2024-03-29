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
    uploadPackages,
} from './shell'
import { tap } from 'rxjs/operators'
import { readFileSync } from 'fs'
import { onHTTPErrors, LocalYouwol } from '@youwol/http-primitives'
import { GetAssetResponse } from '../../lib/assets-backend'
import { GetLibraryInfoResponse } from '../../lib/cdn-backend'
import { firstValueFrom } from 'rxjs'

beforeAll(async () => {
    await firstValueFrom(
        LocalYouwol.setup$({
            localOnly: true,
            authId: 'int_tests_yw-users@test-user',
        }),
    )
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

test('get resource', async () => {
    const test$ = shell$<TestData>().pipe(
        uploadPackage(
            path.resolve(__dirname, './cdn.zip'),
            (shell, resp) => new TestData({ ...shell.context, asset: resp }),
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
                expectAttributes(resp, ['name', 'version', 'main', 'scripts'])
                expect(resp['name']).toBe('@youwol/todo-app-js')
                expect(resp['version']).toBe('0.0.1-wip')
                return shell.context
            },
        ),
    )
    await firstValueFrom(test$)
})

test('get info', async () => {
    const test$ = shell$<TestData>().pipe(
        uploadPackage(
            path.resolve(__dirname, './cdn.zip'),
            (shell, resp) => new TestData({ ...shell.context, asset: resp }),
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
    await firstValueFrom(test$)
})

test('get info with semver query and max-count', async () => {
    const name = '@youwol/todo-app-js-test'
    const versions = [
        '0.0.1',
        '0.0.1-wip',
        '0.0.2',
        '0.1.0',
        '0.1.2',
        '0.2.0-wip',
        '1.1.1',
    ]
    const files = versions.map((version) => {
        return path.resolve(
            __dirname,
            `./test-packages/todo-app-js-test#${version}.zip`,
        )
    })
    const expectReleases = (
        resp: GetLibraryInfoResponse,
        versions: string[],
    ) => {
        expect(resp.releases).toHaveLength(versions.length)
        versions.forEach((version) => {
            expect(
                resp.releases.find((r) => r.version === version),
            ).toBeTruthy()
        })
    }
    const test$ = shell$<TestData>().pipe(
        uploadPackages(files),
        getInfo(
            (_shell) => {
                return { libraryId: window.btoa(name) }
            },
            (shell, resp) => {
                const targets = [
                    '1.1.1',
                    '0.2.0-wip',
                    '0.1.2',
                    '0.1.0',
                    '0.0.2',
                    '0.0.1',
                    '0.0.1-wip',
                ]
                expect(resp.versions).toEqual(targets)
                expectReleases(resp, targets)
                return new TestData({ ...shell.context, metadata: resp })
            },
        ),
        getInfo(
            (_shell) => {
                return {
                    libraryId: window.btoa(name),
                    queryParameters: { maxCount: 3 },
                }
            },
            (shell, resp) => {
                const targets = ['1.1.1', '0.2.0-wip', '0.1.2']
                expect(resp.versions).toEqual(targets)
                expectReleases(resp, targets)
                return new TestData({ ...shell.context, metadata: resp })
            },
        ),
        getInfo(
            (_shell) => {
                return {
                    libraryId: window.btoa(name),
                    queryParameters: { semver: '^0.1.0' },
                }
            },
            (shell, resp) => {
                const targets = ['0.1.2', '0.1.0']
                expect(resp.versions).toEqual(targets)
                expectReleases(resp, targets)
                return new TestData({ ...shell.context, metadata: resp })
            },
        ),
        getInfo(
            (_shell) => {
                return {
                    libraryId: window.btoa(name),
                    queryParameters: { semver: '^0.1.0', maxCount: 1 },
                }
            },
            (shell, resp) => {
                const targets = ['0.1.2']
                expect(resp.versions).toEqual(targets)
                expectReleases(resp, targets)
                return new TestData({ ...shell.context, metadata: resp })
            },
        ),
        getInfo(
            (_shell) => {
                return {
                    libraryId: window.btoa(name),
                    queryParameters: { semver: '^1.0.1' },
                }
            },
            (shell, resp) => {
                const targets = ['1.1.1']
                expect(resp.versions).toEqual(targets)
                expectReleases(resp, targets)
                return new TestData({ ...shell.context, metadata: resp })
            },
        ),
        getInfo(
            (_shell) => {
                return {
                    libraryId: window.btoa(name),
                    queryParameters: { semver: '^0.2.0' },
                }
            },
            (shell, resp) => {
                expect(resp.versions).toEqual([])
                expect(resp.releases).toHaveLength(0)
                return new TestData({ ...shell.context, metadata: resp })
            },
        ),
        getInfo(
            (_shell) => {
                return {
                    libraryId: window.btoa(name),
                    queryParameters: { semver: '^0.3.0' },
                }
            },
            (shell, resp) => {
                expect(resp.versions).toEqual([])
                expect(resp.releases).toHaveLength(0)
                return new TestData({ ...shell.context, metadata: resp })
            },
        ),
    )

    await firstValueFrom(test$)
})

test('get explorer', async () => {
    const test$ = shell$<TestData>().pipe(
        uploadPackage(
            path.resolve(__dirname, './cdn.zip'),
            (shell, resp) => new TestData({ ...shell.context, asset: resp }),
        ),
        getInfo(
            (shell) => ({ libraryId: shell.context.asset.rawId }),
            (shell, resp) => new TestData({ ...shell.context, metadata: resp }),
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

    await firstValueFrom(test$)
})

test('download package', async () => {
    const test$ = shell$<TestData>().pipe(
        uploadPackage(
            path.resolve(__dirname, './cdn.zip'),
            (shell, resp) => new TestData({ ...shell.context, asset: resp }),
        ),
        getInfo(
            (shell) => ({ libraryId: shell.context.asset.rawId }),
            (shell, resp) => new TestData({ ...shell.context, metadata: resp }),
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

    await firstValueFrom(test$)
})

test('delete package', async () => {
    const test$ = shell$<TestData>().pipe(
        uploadPackage(
            path.resolve(__dirname, './cdn.zip'),
            (shell, resp) => new TestData({ ...shell.context, asset: resp }),
        ),
        getInfo(
            (shell) => ({ libraryId: shell.context.asset.rawId }),
            (shell, resp) => new TestData({ ...shell.context, metadata: resp }),
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

    await firstValueFrom(test$)
})
