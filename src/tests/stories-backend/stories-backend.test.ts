// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import '../mock-requests'
import {
    healthz,
    addDocuments,
    addPlugin,
    deleteDocument,
    deleteStory,
    downloadZip,
    getContent,
    getGlobalContents,
    moveDocument,
    publish,
    queryDocuments,
    updateContent,
    updateDocument,
    updateGlobalContents,
    createStory,
    getStory,
    upgradePlugins,
} from './shell'
import {
    expectAssetAttributes,
    expectAttributes,
    Shell,
    shell$,
} from '../common'
import {
    CreateStoryResponse,
    GetDocumentResponse,
} from '../../lib/stories-backend'

import { readFileSync } from 'fs'
import path from 'path'

import { NewAssetResponse } from '../../lib/assets-gateway'
import { purgeDrive, trashItem } from '../treedb-backend'
import { getAsset } from '../assets-backend'
import { LocalYouwol } from '@youwol/http-primitives'

beforeAll((done) => {
    LocalYouwol.setup$({
        localOnly: true,
        email: 'int_tests_yw-users@test-user',
    }).subscribe(() => {
        done()
    })
})

class TestData {
    public readonly storyId?: string
    public readonly rootDocumentId?: string
    public readonly pages: { [k: string]: GetDocumentResponse }
    public readonly downloadedZip: Blob
    constructor(params: {
        storyId?: string
        rootDocumentId?: string
        downloadedZip?: Blob
    }) {
        Object.assign(this, params)
    }
}

test('healthz', (done) => {
    class Context {}

    shell$<Context>()
        .pipe(healthz())
        .subscribe((resp) => {
            expect(resp).toBeTruthy()
            done()
        })
})

test('create story, play with content', (done) => {
    const title = 'test story: play with content'
    const initialContent = {
        html: '<div id="root_test-story-play-with-content" data-gjs-type="root" class="root" style="height:100%; width:100%; overflow:auto"></div>',
        css: '',
        components: '',
        styles: '',
    }
    const storyId = 'test-story-play-with-content'
    shell$<TestData>()
        .pipe(
            createStory({
                inputs: (shell) => ({
                    body: {
                        storyId,
                        title,
                    },
                    queryParameters: { folderId: shell.homeFolderId },
                }),
                sideEffects: (resp: NewAssetResponse<CreateStoryResponse>) => {
                    expectAssetAttributes(resp)
                    expect(resp.name).toBe(title)
                },
            }),
            getStory({
                inputs: () => ({ storyId }),
                sideEffects: (resp) => {
                    expect(resp.storyId).toBe(storyId)
                    expect(resp.title).toBe(title)
                    expect(resp.rootDocumentId).toBe(`root_${resp.storyId}`)
                    expect(resp.authors).toHaveLength(1)
                },
                newContext: (shell, resp) => {
                    return new TestData({ ...shell.context, ...resp })
                },
            }),
            getContent(
                (shell) => ({
                    documentId: shell.context.rootDocumentId,
                    storyId: shell.context.storyId,
                }),
                (shell, resp) => {
                    expect(resp).toEqual(initialContent)
                    return shell.context
                },
            ),
            updateContent(
                (shell) => ({
                    documentId: shell.context.rootDocumentId,
                    storyId: shell.context.storyId,
                    body: {
                        html: '<div> Hello world </div>',
                        css: '',
                        components: '',
                        styles: '',
                    },
                }),
                (shell) => {
                    return shell.context
                },
            ),
            getContent(
                (shell) => ({
                    documentId: shell.context.rootDocumentId,
                    storyId: shell.context.storyId,
                }),
                (shell, resp) => {
                    expect(resp.html).toBe('<div> Hello world </div>')
                    return shell.context
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('create story, play with documents', (done) => {
    const title = 'test story: play with documents'
    const storyId = 'test-story-play-with-documents'
    shell$<TestData>()
        .pipe(
            createStory({
                inputs: (shell) => ({
                    body: {
                        storyId,
                        title,
                    },
                    queryParameters: { folderId: shell.homeFolderId },
                }),
                sideEffects: (resp: NewAssetResponse<CreateStoryResponse>) => {
                    expectAssetAttributes(resp)
                    expect(resp.name).toBe(title)
                },
            }),
            getStory({
                inputs: () => ({ storyId }),
                newContext: (shell, resp) => {
                    return new TestData({ ...shell.context, ...resp })
                },
            }),
            queryDocuments(
                (shell) => ({
                    storyId: shell.context.storyId,
                    parentDocumentId: shell.context.rootDocumentId,
                    fromIndex: 0,
                    count: 100,
                }),
                (shell, resp) => {
                    expect(resp.documents).toHaveLength(0)
                    return shell.context
                },
            ),
            addDocuments(
                (shell: Shell<TestData>) => ({
                    storyId: shell.context.storyId,
                    parentDocumentId: shell.context.rootDocumentId,
                    titles: ['page0'],
                    contents: {
                        page0: {
                            html: '<div>content of page0</div>',
                            css: '',
                            components: '',
                            styles: '',
                        },
                    },
                }),
                (shell, [resp]) => {
                    expectAttributes(resp, [
                        'storyId',
                        'documentId',
                        'parentDocumentId',
                        'title',
                        'contentId',
                        'position',
                    ])
                    expect(resp.storyId).toBe(storyId)
                    expect(resp.parentDocumentId).toBe(`root_${storyId}`)
                    expect(resp.title).toBe(`page0`)
                    return shell.context
                },
            ),
            queryDocuments(
                (shell) => ({
                    storyId: shell.context.storyId,
                    parentDocumentId: shell.context.rootDocumentId,
                    fromIndex: 0,
                    count: 100,
                }),
                (shell, resp) => {
                    expect(resp.documents).toHaveLength(1)
                    expect(resp.documents[0].title).toBe(`page0`)
                    return {
                        ...shell.context,
                        pages: { [resp.documents[0].title]: resp.documents[0] },
                    }
                },
            ),
            updateDocument(
                (shell) => ({
                    storyId: shell.context.storyId,
                    documentId: shell.context.pages['page0'].documentId,
                    body: { title: 'page0 - updated' },
                }),
                (shell, resp) => {
                    expect(resp.title).toBe(`page0 - updated`)
                    return shell.context
                },
            ),
            deleteDocument(
                (shell) => ({
                    storyId: shell.context.storyId,
                    documentId: shell.context.pages['page0'].documentId,
                }),
                (shell, resp) => {
                    expect(resp.deletedDocuments).toBe(1)
                    return shell.context
                },
            ),
            queryDocuments(
                (shell) => ({
                    storyId: shell.context.storyId,
                    parentDocumentId: shell.context.rootDocumentId,
                    fromIndex: 0,
                    count: 100,
                }),
                (shell, resp) => {
                    expect(resp.documents).toHaveLength(0)
                    return shell.context
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

test('create story, play with global attributes', (done) => {
    const title = 'test story: play with content'
    const storyId = 'test-story-play-with-content'
    shell$<TestData>()
        .pipe(
            createStory({
                inputs: (shell) => ({
                    body: {
                        storyId,
                        title,
                    },
                    queryParameters: { folderId: shell.homeFolderId },
                }),
            }),
            getStory({
                inputs: () => ({ storyId }),
                sideEffects: (resp) => {
                    expect(resp.storyId).toBe(storyId)
                    expect(resp.title).toBe(title)
                    expect(resp.rootDocumentId).toBe(`root_${resp.storyId}`)
                    expect(resp.authors).toHaveLength(1)
                },
                newContext: (shell) => {
                    return shell.context
                },
            }),
            getGlobalContents(storyId, (shell, _resp) => {
                return shell.context
            }),
            updateGlobalContents(
                storyId,
                { javascript: 'test javascript' },
                (shell, _resp) => {
                    return shell.context
                },
            ),
            getGlobalContents(storyId, (shell, resp) => {
                expect(resp.javascript).toBe('test javascript')
                return shell.context
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('create story, play with plugins', (done) => {
    const title = 'test story: play with plugins'
    const storyId = 'test-story-play-with-plugins'
    shell$<TestData>()
        .pipe(
            createStory({
                inputs: (shell) => ({
                    body: {
                        storyId,
                        title,
                    },
                    queryParameters: { folderId: shell.homeFolderId },
                }),
            }),
            getStory({
                inputs: () => ({ storyId }),
                newContext: (shell, resp) => {
                    return new TestData({ ...shell.context, ...resp })
                },
            }),
            addPlugin(
                (shell) => ({
                    storyId: shell.context.storyId,
                    body: { packageName: '@youwol/http-clients' },
                    headers: { 'py-youwol-local-only': 'false' },
                }),
                (shell, resp) => {
                    expect(resp.packageName).toBe('@youwol/http-clients')
                    return shell.context
                },
            ),
            getStory({
                inputs: () => ({ storyId }),
                sideEffects: (resp) => {
                    expect(resp.requirements.plugins).toEqual([
                        '@youwol/http-clients',
                    ])
                },
                newContext: (shell) => {
                    return shell.context
                },
            }),
            upgradePlugins({
                inputs: () => ({
                    storyId,
                    body: {},
                    callerOptions: {
                        headers: { 'py-youwol-local-only': 'false' },
                    },
                }),
                sideEffects: (resp) => {
                    expect(resp.requirements.plugins).toEqual([
                        '@youwol/http-clients',
                    ])
                },
                newContext: (shell) => {
                    return shell.context
                },
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('move-document', (done) => {
    const title = 'test story: play with content'
    const storyId = 'test-story-play-with-content'

    const addDoc = (title: string) => {
        return addDocuments(
            (shell: Shell<TestData>) => ({
                storyId: shell.context.storyId,
                parentDocumentId: shell.context.rootDocumentId,
                titles: [title],
            }),
            (shell, _resp) => {
                return shell.context
            },
        )
    }
    shell$<TestData>()
        .pipe(
            createStory({
                inputs: (shell) => ({
                    body: {
                        storyId,
                        title,
                    },
                    queryParameters: { folderId: shell.homeFolderId },
                }),
            }),
            getStory({
                inputs: () => ({ storyId }),
                newContext: (shell, resp) => {
                    return new TestData({
                        ...shell.context,
                        storyId: resp.storyId,
                        rootDocumentId: resp.rootDocumentId,
                    })
                },
            }),
            // Not as the same time to control order
            addDoc('page1'),
            addDoc('page2'),
            addDoc('page3'),
            queryDocuments(
                (shell) => ({
                    storyId: shell.context.storyId,
                    parentDocumentId: shell.context.rootDocumentId,
                    fromIndex: 0,
                    count: 100,
                }),
                (shell, resp) => {
                    expect(resp.documents.map((c) => c.title)).toEqual([
                        'page1',
                        'page2',
                        'page3',
                    ])
                    return {
                        ...shell.context,
                        pages: resp.documents.reduce(
                            (acc, e) => ({ ...acc, [e.title]: e }),
                            {},
                        ),
                    }
                },
            ),
            moveDocument(
                (shell) => ({
                    storyId: shell.context.storyId,
                    documentId: shell.context.pages['page1'].documentId,
                    destination: {
                        parent: shell.context.rootDocumentId,
                        position: shell.context.pages['page3'].position + 1,
                    },
                }),
                (shell, _resp) => {
                    return shell.context
                },
            ),
            queryDocuments(
                (shell) => ({
                    storyId: shell.context.storyId,
                    parentDocumentId: shell.context.rootDocumentId,
                    fromIndex: 0,
                    count: 100,
                }),
                (shell, resp) => {
                    expect(resp.documents.map((c) => c.title)).toEqual([
                        'page2',
                        'page3',
                        'page1',
                    ])
                    return shell.context
                },
            ),
        )
        .subscribe(() => {
            done()
        })
})

// eslint-disable-next-line jest/no-disabled-tests -- waiting to TG-
test.skip('publish story', (done) => {
    const buffer = readFileSync(path.resolve(__dirname, './story.zip'))
    const arraybuffer = Uint8Array.from(buffer).buffer
    const storyId = 'ce0ee416-048a-486c-ab08-23ad8c05b25c'

    shell$<TestData>()
        .pipe(
            publish(
                (shell) => ({
                    folderId: shell.homeFolderId,
                    filename: 'story.zip',
                    blob: new Blob([arraybuffer]),
                }),
                (shell) => {
                    return shell.context
                },
            ),
            getStory({
                inputs: () => ({ storyId }),
                sideEffects: (resp) => {
                    expect(resp.storyId).toBe(storyId)
                    expect(resp.requirements.plugins).toHaveLength(1)
                },
            }),
            downloadZip(
                () => ({ storyId }),
                (shell, resp) => {
                    return { ...shell.context, downloadedZip: resp }
                },
            ),
            deleteStory(
                () => ({ storyId, withUrlQueryParams: { purge: true } }),
                (shell) => {
                    return shell.context
                },
            ),
            getStory({
                inputs: () => ({ storyId }),
                authorizedErrors: (error) => {
                    return error.status == 404
                },
            }),
            publish(
                (shell) => ({
                    folderId: shell.homeFolderId,
                    filename: 'story.zip',
                    blob: shell.context.downloadedZip,
                }),
                (shell) => {
                    return shell.context
                },
            ),
            getStory({
                inputs: () => ({ storyId }),
                sideEffects: (resp) => {
                    expect(resp.storyId).toBe(storyId)
                    expect(resp.requirements.plugins).toHaveLength(1)
                },
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('new story, delete from explorer (purge)', (done) => {
    class Context {
        public readonly title = 'test story: play with content'
        public readonly storyId = 'test-story-play-with-content'
        public readonly itemId: string
        public readonly assetId: string
        constructor(params: { itemId?: string; assetId?: string } = {}) {
            Object.assign(this, params)
        }
    }
    shell$<Context>(new Context())
        .pipe(
            createStory({
                inputs: (shell) => ({
                    body: {
                        storyId: shell.context.storyId,
                        title: shell.context.title,
                    },
                    queryParameters: { folderId: shell.homeFolderId },
                }),
                newContext: (
                    shell,
                    resp: NewAssetResponse<CreateStoryResponse>,
                ) => {
                    return new Context({
                        ...shell.context,
                        itemId: resp.itemId,
                        assetId: resp.assetId,
                    })
                },
            }),
            trashItem({
                inputs: (shell) => ({ itemId: shell.context.itemId }),
            }),
            purgeDrive({
                inputs: (shell) => ({ driveId: shell.defaultDriveId }),
            }),
            getStory({
                inputs: (shell) => ({ storyId: shell.context.storyId }),
                authorizedErrors: (resp) => {
                    expect(resp.status).toBe(404)
                    return true
                },
            }),
            getAsset({
                inputs: (shell) => ({ assetId: shell.context.assetId }),
                authorizedErrors: (resp) => {
                    expect(resp.status).toBe(404)
                    return true
                },
            }),
        )
        .subscribe(() => {
            done()
        })
})
