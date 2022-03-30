// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import { mergeMap, tap } from 'rxjs/operators'
import { onHTTPErrors, raiseHTTPErrors } from '../../lib'
import {
    Asset,
    AssetsGatewayClient,
    DefaultDriveResponse,
    DocumentResponse,
    DocumentsResponse,
    PostPluginResponse,
    StoryResponse,
} from '../../lib/assets-gateway'
import {
    expectAssetAttributes,
    expectAttributes,
    resetPyYouwolDbs$,
} from '../common'
import '../mock-requests'
import { readFileSync } from 'fs'
import path from 'path'

const assetsGtw = new AssetsGatewayClient()

let homeFolderId: string
let driveId: string

beforeAll(async (done) => {
    jest.setTimeout(90 * 1000)
    resetPyYouwolDbs$()
        .pipe(
            mergeMap(() => assetsGtw.explorer.getDefaultUserDrive$()),
            raiseHTTPErrors(),
        )
        .subscribe((resp: DefaultDriveResponse) => {
            homeFolderId = resp.homeFolderId
            driveId = resp.driveId
            done()
        })
})

test('create story, play with content', (done) => {
    const title = 'test story: play with content'
    const initialContent = { html: '', css: '', components: '', styles: '' }
    const storyId = 'test-story-play-with-content'

    assetsGtw.assets.story
        .create$(homeFolderId, {
            title,
            storyId,
        })
        .pipe(
            raiseHTTPErrors(),
            tap((resp: Asset) => {
                expectAssetAttributes(resp)
                expect(resp.name).toBe(title)
            }),
            mergeMap((resp: Asset) =>
                assetsGtw.raw.story.getStory$(resp.rawId),
            ),
            raiseHTTPErrors(),
            tap((story: StoryResponse) => {
                expectAttributes(story, [
                    'storyId',
                    'rootDocumentId',
                    'title',
                    'authors',
                ])
                expect(story.storyId).toBe(storyId)
                expect(story.title).toBe(title)
                expect(story.rootDocumentId).toBe(`root_${story.storyId}`)
                expect(story.authors).toHaveLength(1)
            }),
            mergeMap((resp: StoryResponse) =>
                assetsGtw.raw.story.getContent$(
                    resp.storyId,
                    resp.rootDocumentId,
                ),
            ),
            raiseHTTPErrors(),
            tap((content) => {
                expect(content).toEqual(initialContent)
            }),
            mergeMap(() =>
                assetsGtw.raw.story.updateContent$(storyId, `root_${storyId}`, {
                    html: '<div> Hello world </div>',
                    css: '',
                    components: '',
                    styles: '',
                }),
            ),
            raiseHTTPErrors(),
            mergeMap(() =>
                assetsGtw.raw.story.getContent$(storyId, `root_${storyId}`),
            ),
            raiseHTTPErrors(),
            tap((content) => {
                expect(content.html).toBe('<div> Hello world </div>')
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('create story, play with documents', (done) => {
    const title = 'test story: play with documents'
    const storyId = 'test-story-play-with-documents'

    assetsGtw.assets.story
        .create$(homeFolderId, {
            title,
            storyId,
        })
        .pipe(
            raiseHTTPErrors(),
            tap((resp: Asset) => {
                expectAssetAttributes(resp)
                expect(resp.name).toBe(title)
            }),
            mergeMap((resp: Asset) =>
                assetsGtw.raw.story.getStory$(resp.rawId),
            ),
            raiseHTTPErrors(),
            /*mergeMap((resp: Story) =>
                assetsGtw.raw.story.getDocument$(
                    resp.storyId,
                    resp.rootDocumentId,
                ),
            ),
            raiseHTTPErrors(),
            tap((resp: Document) => {
                expect(resp).toBeTruthy()
            }),*/
            mergeMap(() =>
                assetsGtw.raw.story.queryDocuments$(
                    storyId,
                    `root_${storyId}`,
                    0,
                    100,
                ),
            ),
            raiseHTTPErrors(),
            tap((resp: DocumentsResponse) => {
                expect(resp.documents).toHaveLength(0)
            }),
            mergeMap(() =>
                assetsGtw.raw.story.createDocument$(storyId, {
                    parentDocumentId: `root_${storyId}`,
                    title: 'page0',
                    content: {
                        html: '<div>content of page0</div>',
                        css: '',
                        components: '',
                        styles: '',
                    },
                }),
            ),
            raiseHTTPErrors(),
            tap((resp: DocumentResponse) => {
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
            }),
            mergeMap((resp: DocumentResponse) =>
                assetsGtw.raw.story.queryDocuments$(
                    resp.storyId,
                    resp.parentDocumentId,
                    0,
                    100,
                ),
            ),
            raiseHTTPErrors(),
            tap((resp: DocumentsResponse) => {
                expect(resp.documents).toHaveLength(1)
                expect(resp.documents[0].title).toBe(`page0`)
            }),
            mergeMap((resp: DocumentsResponse) => {
                const doc = resp.documents[0]
                return assetsGtw.raw.story.updateDocument$(
                    doc.storyId,
                    doc.documentId,
                    { title: 'page0 - updated' },
                )
            }),
            raiseHTTPErrors(),
            tap((resp: Document) => {
                expect(resp.title).toBe(`page0 - updated`)
            }),
            mergeMap((resp: DocumentResponse) =>
                assetsGtw.raw.story.deleteDocument$(
                    resp.storyId,
                    resp.documentId,
                ),
            ),
            raiseHTTPErrors(),
            mergeMap(() =>
                assetsGtw.raw.story.queryDocuments$(
                    storyId,
                    `root_${storyId}`,
                    0,
                    100,
                ),
            ),
            raiseHTTPErrors(),
            tap((resp: DocumentsResponse) => {
                expect(resp.documents).toHaveLength(0)
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('create story, play with plugins', (done) => {
    const title = 'test story: play with plugins'
    const storyId = 'test-story-play-with-plugins'

    assetsGtw.assets.story
        .create$(homeFolderId, {
            title,
            storyId,
        })
        .pipe(
            raiseHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.raw.story.addPlugin$(
                    storyId,
                    {
                        packageName: '@youwol/http-clients',
                    },
                    { headers: { 'py-youwol-local-only': 'false' } },
                )
            }),
            raiseHTTPErrors(),
            tap((resp: PostPluginResponse) => {
                expect(resp.packageName).toBe('@youwol/http-clients')
            }),
            mergeMap(() => {
                return assetsGtw.raw.story.getStory$(storyId)
            }),
            raiseHTTPErrors(),
            tap((resp) => {
                expect(resp.requirements.plugins).toEqual([
                    '@youwol/http-clients',
                ])
            }),
        )
        .subscribe(() => {
            done()
        })
})

test('publish story', (done) => {
    const buffer = readFileSync(path.resolve(__dirname, './story.zip'))
    const arraybuffer = Uint8Array.from(buffer).buffer
    const storyId = 'ce0ee416-048a-486c-ab08-23ad8c05b25c'
    let downloadedBlob
    assetsGtw.assets.story
        .publish$(homeFolderId, 'story.zip', new Blob([arraybuffer]))
        .pipe(
            raiseHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.raw.story.getStory$(storyId)
            }),
            raiseHTTPErrors(),
            tap((resp: StoryResponse) => {
                expect(resp.storyId).toBe(storyId)
                expect(resp.requirements.plugins.length).toEqual(1)
            }),
            mergeMap(() => {
                return assetsGtw.raw.story.downloadZip$(storyId)
            }),
            raiseHTTPErrors(),
            tap((resp: Blob) => {
                expect(resp).toBeInstanceOf(Blob)
                downloadedBlob = resp
            }),
            mergeMap(() => {
                return assetsGtw.explorer.items.delete$(btoa(storyId))
            }),
            raiseHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.explorer.drives.purge$(driveId)
            }),
            raiseHTTPErrors(),
            mergeMap((resp) => {
                expect(resp.itemsCount).toBe(1)
                expect(resp.items[0].itemId).toBe(btoa(storyId))
                return assetsGtw.raw.story.getStory$(storyId)
            }),
            onHTTPErrors((resp) => {
                expect(resp.status).toBe(404)
                return undefined
            }),
            mergeMap(() => {
                return assetsGtw.assets.story.publish$(
                    homeFolderId,
                    'story.zip',
                    downloadedBlob,
                )
            }),
            raiseHTTPErrors(),
            mergeMap(() => {
                return assetsGtw.raw.story.getStory$(storyId)
            }),
            raiseHTTPErrors(),
            tap((resp: StoryResponse) => {
                expect(resp.storyId).toBe(storyId)
                expect(resp.requirements.plugins.length).toEqual(1)
            }),
        )
        .subscribe(() => {
            done()
        })
})
