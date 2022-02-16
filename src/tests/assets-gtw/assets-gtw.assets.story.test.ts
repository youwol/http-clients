/** @format */

// eslint-disable-next-line eslint-comments/disable-enable-pair -- to not have problem
/* eslint-disable jest/no-done-callback -- eslint-comment It is required because */

import '../mock-requests'
import {
    Asset,
    AssetsGatewayClient,
    DefaultDriveResponse,
} from '../../lib/assets-gateway'
import {
    expectAssetAttributes,
    expectAttributes,
    resetPyYouwolDbs$,
} from '../common'
import { raiseHTTPErrors } from '../../lib'
import { mergeMap, tap } from 'rxjs/operators'
import {
    Document,
    DocumentsResponse,
    Story,
} from '../../lib/assets-gateway/routers/raw/story'

const assetsGtw = new AssetsGatewayClient()

let homeFolderId: string

beforeAll(async (done) => {
    jest.setTimeout(90 * 1000)
    resetPyYouwolDbs$()
        .pipe(
            mergeMap(() => assetsGtw.explorer.getDefaultUserDrive$()),
            raiseHTTPErrors(),
        )
        .subscribe((resp: DefaultDriveResponse) => {
            homeFolderId = resp.homeFolderId
            done()
        })
})

test('create story, play with content', (done) => {
    const title = 'test story: play with content'
    const initialContent = 'You can start writing your story :)'
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
            tap((story: Story) => {
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
            mergeMap((resp: Story) =>
                assetsGtw.raw.story.getContent$(
                    resp.storyId,
                    resp.rootDocumentId,
                ),
            ),
            raiseHTTPErrors(),
            tap((content: string) => {
                expect(content).toBe(initialContent)
            }),
            mergeMap(() =>
                assetsGtw.raw.story.updateContent$(storyId, `root_${storyId}`, {
                    content: 'updated content',
                }),
            ),
            raiseHTTPErrors(),
            mergeMap(() =>
                assetsGtw.raw.story.getContent$(storyId, `root_${storyId}`),
            ),
            raiseHTTPErrors(),
            tap((content: string) => {
                expect(content).toBe('updated content')
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
            mergeMap((resp: Story) =>
                assetsGtw.raw.story.queryDocuments$(
                    resp.storyId,
                    resp.rootDocumentId,
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
                    content: 'content of page0',
                }),
            ),
            raiseHTTPErrors(),
            tap((resp: Document) => {
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
            mergeMap((resp: Document) =>
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
            mergeMap((resp: Document) =>
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
