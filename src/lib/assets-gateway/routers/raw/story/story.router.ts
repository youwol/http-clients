/** @format */

import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../../utils'
import { Document, DocumentsResponse, Story } from './interfaces'

export class RawStoryRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/story`)
    }

    /**
     * Get a specific story.
     *
     * @param storyId
     * @param callerOptions
     */
    getStory$(
        storyId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Story> {
        return this.send$({
            command: 'query',
            path: `/${storyId}`,
            callerOptions,
        })
    }

    /**
     * Query children documents of a document.
     *
     * @param storyId
     * @param parentDocumentId
     * @param fromIndex starting children document's index
     * @param count number of document returned after start at fromIndex (included)
     * @param callerOptions
     */
    queryDocuments$(
        storyId: string,
        parentDocumentId: string,
        fromIndex: number,
        count: number,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<DocumentsResponse> {
        return this.send$({
            command: 'query',
            path: `/${storyId}/documents/${parentDocumentId}/children?from-index=${fromIndex}&count=${count}`,
            callerOptions,
        })
    }

    /**
     * Create a document.
     *
     * @param storyId story in which the document belongs
     * @param body
     * @param body.parentDocumentId parent document id
     * @param body.title title of the document
     * @param body.content content of the document
     * @param callerOptions
     */
    createDocument$(
        storyId: string,
        body: { parentDocumentId: string; title: string; content: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Document> {
        return this.send$({
            command: 'create',
            path: `/${storyId}/documents`,
            nativeRequestOptions: {
                json: body,
                method: 'POST',
            },
            callerOptions,
        })
    }

    /**
     * Update a document.
     *
     * @param storyId story in which the document belongs
     * @param documentId id of the document to update
     * @param body
     * @param body.title title of the document
     * @param callerOptions
     */
    updateDocument$(
        storyId: string,
        documentId: string,
        body: { title: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Document> {
        return this.send$({
            command: 'update',
            path: `/${storyId}/documents/${documentId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Delete a document.
     *
     * @param storyId story in which the document belongs
     * @param documentId id of the document to delete
     * @param callerOptions
     */
    deleteDocument$(
        storyId: string,
        documentId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Document> {
        return this.send$({
            command: 'update',
            path: `/${storyId}/documents/${documentId}/delete`,
            nativeRequestOptions: {
                method: 'POST',
            },
            callerOptions,
        })
    }

    /**
     * Retrieve document's content.
     *
     * @param storyId story in which the document belongs
     * @param documentId id of the document to delete
     * @param callerOptions
     */
    getContent$(
        storyId: string,
        documentId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<string> {
        return this.send$({
            command: 'query',
            path: `/${storyId}/contents/${documentId}`,
            callerOptions,
        })
    }

    /**
     * Update document's content.
     *
     * @param storyId story in which the document belongs
     * @param documentId id of the document to update
     * @param body
     * @param body.content new content
     * @param callerOptions
     */
    updateContent$(
        storyId: string,
        documentId: string,
        body: { content: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<boolean> {
        return this.send$({
            command: 'update',
            path: `/${storyId}/contents/${documentId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }
}
