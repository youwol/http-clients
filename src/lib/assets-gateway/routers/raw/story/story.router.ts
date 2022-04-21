import { Router } from '../../../../router'
import {
    CallerRequestOptions,
    downloadBlob,
    HTTPResponse$,
} from '../../../../utils'
import {
    GetContentResponse,
    GetDocumentResponse,
    QueryDocumentsResponse,
    AddPluginResponse,
    StoryResponse,
    DocumentContentBody,
} from '../../../../stories-backend'

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
    ): HTTPResponse$<StoryResponse> {
        return this.send$({
            command: 'query',
            path: `/${storyId}`,
            callerOptions,
        })
    }

    /**
     * Get a specific document.
     *
     * @param storyId
     * @param documentId
     * @param callerOptions
     */
    getDocument$(
        storyId: string,
        documentId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetDocumentResponse> {
        return this.send$({
            command: 'query',
            path: `/${storyId}/documents/${documentId}`,
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
        fromIndex = 0,
        count = 1000,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<QueryDocumentsResponse> {
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
        body: {
            parentDocumentId: string
            title: string
            content?: DocumentContentBody
        },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetDocumentResponse> {
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
    ): HTTPResponse$<GetDocumentResponse> {
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
    ): HTTPResponse$<GetDocumentResponse> {
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
    ): HTTPResponse$<GetContentResponse> {
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
        body: DocumentContentBody,
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

    addPlugin$(
        storyId: string,
        body: { packageName: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<AddPluginResponse> {
        return this.send$({
            command: 'update',
            path: `/${storyId}/plugins`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    downloadZip$(
        storyId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/${storyId}/download-zip`,
            storyId,
            {},
            callerOptions,
        )
    }
}
