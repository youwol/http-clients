import '../mock-requests'
import {
    healthz,
    addDocuments,
    addPlugin,
    createStory,
    deleteDocument,
    deleteStory,
    downloadZip,
    getContent,
    getGlobalContents,
    getStory,
    moveDocument,
    publish,
    queryDocuments,
    updateContent,
    updateDocument,
    updateGlobalContents,
} from './shell.operators'
import {
    expectAssetAttributes,
    expectAttributes,
    resetPyYouwolDbs$,
    Shell,
    shell$,
} from '../common'
import { DocumentResponse } from '../../lib/stories-backend'
import { onHTTPErrors } from '../../lib'
import { readFileSync } from 'fs'
import path from 'path'

jest.setTimeout(30 * 1000)
beforeAll(async (done) => {
    resetPyYouwolDbs$().subscribe(() => {
        done()
    })
})

class TestData {
    public readonly storyId?: string
    public readonly rootDocumentId?: string
    public readonly pages: { [k: string]: DocumentResponse }
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
        .subscribe(() => {
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
            createStory(storyId, title, (shell, resp) => {
                expectAssetAttributes(resp)
                expect(resp.name).toBe(title)
                return shell.context
            }),
            getStory(storyId, (shell, resp) => {
                expectAttributes(resp, [
                    'storyId',
                    'rootDocumentId',
                    'title',
                    'authors',
                ])
                expect(resp.storyId).toBe(storyId)
                expect(resp.title).toBe(title)
                expect(resp.rootDocumentId).toBe(`root_${resp.storyId}`)
                expect(resp.authors).toHaveLength(1)
                return { ...shell.context, ...resp }
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
            createStory(storyId, title, (shell, resp) => {
                expectAssetAttributes(resp)
                expect(resp.name).toBe(title)
                return shell.context
            }),
            getStory(storyId, (shell, resp) => {
                return { ...shell.context, ...resp }
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
            createStory(storyId, title, (shell, _resp) => {
                return shell.context
            }),
            getStory(storyId, (shell, resp) => {
                expect(resp.storyId).toBe(storyId)
                expect(resp.title).toBe(title)
                expect(resp.rootDocumentId).toBe(`root_${resp.storyId}`)
                expect(resp.authors).toHaveLength(1)
                return shell.context
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
            createStory(storyId, title, (shell, _resp) => {
                return shell.context
            }),
            getStory(storyId, (shell, resp) => {
                return { ...shell.context, ...resp }
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
            getStory(storyId, (shell, resp) => {
                expect(resp.requirements.plugins).toEqual([
                    '@youwol/http-clients',
                ])
                return shell.context
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('move-document', (done) => {
    const title = 'test story: play with content'
    const storyId = 'test-story-play-with-content'

    let addDoc = (title: string) => {
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
            createStory(storyId, title, (shell) => {
                return shell.context
            }),
            getStory(storyId, (shell, resp) => {
                return {
                    ...shell.context,
                    storyId: resp.storyId,
                    rootDocumentId: resp.rootDocumentId,
                }
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

test('publish story', (done) => {
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
            getStory(storyId, (shell, resp) => {
                expect(resp.storyId).toBe(storyId)
                expect(resp.requirements.plugins.length).toEqual(1)
                return shell.context
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
            getStory(
                storyId,
                (shell) => {
                    expect(false).toBeTruthy()
                    return shell.context
                },
                onHTTPErrors((resp) => {
                    expect(resp.status).toBe(404)
                    return 'ErrorManaged'
                }),
            ),
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
            getStory(storyId, (shell, resp) => {
                expect(resp.storyId).toBe(storyId)
                expect(resp.requirements.plugins.length).toEqual(1)
                return shell.context
            }),
        )
        .subscribe(() => {
            done()
        })
})
