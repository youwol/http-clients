import {
    CallerRequestOptions,
    downloadBlob,
    HTTPError,
    HTTPResponse$,
    uploadBlob,
} from '../utils'
import {
    GetGlobalContentResponse,
    HealthzResponse,
    MoveDocumentBody,
    MoveDocumentResponse,
    PostGlobalContentBody,
    StoryResponse,
    DocumentContentBody,
    DocumentResponse,
    DocumentsResponse,
    DocumentContentResp,
    PostPluginResponse,
    AddPluginBody,
    UpdateDocumentBody,
    DeleteDocumentResponse,
    DeleteStoryResponse,
} from './interfaces'
import { RootRouter } from '../router'
import { Observable } from 'rxjs'
import { Asset } from '../assets-gateway'

export class StoriesClient extends RootRouter {
    constructor({
        headers,
        basePath,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
    } = {}) {
        super({
            basePath: basePath || '/api/stories-backend',
            headers,
        })
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<HealthzResponse> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }

    /**
     * Create an empty story.
     *
     * @param body
     * @param body.storyId id of the story
     * @param body.title title of the story
     * @param folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return story response or asset depending on whether the client is used through assets-gtw
     */
    create$(
        body: { storyId?: string; title: string },
        folderId?: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset | StoryResponse> {
        const suffix = folderId ? `?folder-id=${folderId}` : ''
        return this.send$({
            command: 'create',
            path: `/stories${suffix}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }

    /**
     * Publish a story from a .zip file
     *
     * @param fileName string
     * @param blob Blob content of the zip file
     * @param folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return story response or asset depending on whether the client is used through assets-gtw
     */
    publish$(
        fileName: string,
        blob: Blob,
        folderId?: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset | StoryResponse> {
        const suffix = folderId ? `?folder-id=${folderId}` : ''
        return uploadBlob(
            `${this.basePath}/stories${suffix}`,
            fileName,
            'POST',
            blob,
            {},
            callerOptions,
        ) as Observable<null | HTTPError>
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
            path: `/stories/${storyId}`,
            callerOptions,
        })
    }

    /**
     * Delete a specific story.
     *
     * @param storyId
     * @param callerOptions
     */
    deleteStory$(
        storyId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<DeleteStoryResponse> {
        return this.send$({
            command: 'delete',
            path: `/stories/${storyId}`,
            callerOptions,
        })
    }

    /**
     * Get global contents (css, javascript, components) of a story
     *
     * @param storyId storyId
     * @param callerOptions
     */
    getGlobalContents$(
        storyId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetGlobalContentResponse> {
        return this.send$({
            command: 'query',
            path: `/stories/${storyId}/global-contents`,
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
    ): HTTPResponse$<DocumentResponse> {
        return this.send$({
            command: 'query',
            path: `/stories/${storyId}/documents/${documentId}`,
            callerOptions,
        })
    }

    /**
     * Update global contents (css, javascript, components) of a story
     *
     * @param storyId storyId
     * @param body body
     * @param callerOptions
     */
    updateGlobalContents$(
        storyId: string,
        body: PostGlobalContentBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<{}> {
        return this.send$({
            command: 'update',
            path: `/stories/${storyId}/global-contents`,
            nativeRequestOptions: {
                json: body,
            },
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
    ): HTTPResponse$<DocumentResponse> {
        return this.send$({
            command: 'create',
            path: `/stories/${storyId}/documents`,
            nativeRequestOptions: {
                json: body,
                method: 'PUT',
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
        body: UpdateDocumentBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<DocumentResponse> {
        return this.send$({
            command: 'update',
            path: `/stories/${storyId}/documents/${documentId}`,
            nativeRequestOptions: {
                json: body,
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
    ): HTTPResponse$<DocumentContentResp> {
        return this.send$({
            command: 'query',
            path: `/stories/${storyId}/contents/${documentId}`,
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
            path: `/stories/${storyId}/contents/${documentId}`,
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
    ): HTTPResponse$<DeleteDocumentResponse> {
        return this.send$({
            command: 'delete',
            path: `/stories/${storyId}/documents/${documentId}`,
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
    ): HTTPResponse$<DocumentsResponse> {
        return this.send$({
            command: 'query',
            path: `/stories/${storyId}/documents/${parentDocumentId}/children?from-index=${fromIndex}&count=${count}`,
            callerOptions,
        })
    }

    /**
     * Move a document within a story
     *
     * @param storyId storyId
     * @param documentId documentId
     * @param body body
     * @param callerOptions
     */
    moveDocument$(
        storyId: string,
        documentId: string,
        body: MoveDocumentBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<MoveDocumentResponse> {
        return this.send$({
            command: 'update',
            path: `/stories/${storyId}/documents/${documentId}/move`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * add a plugin to a story
     *
     * @param storyId storyId
     * @param body body
     * @param callerOptions
     */
    addPlugin$(
        storyId: string,
        body: AddPluginBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<PostPluginResponse> {
        return this.send$({
            command: 'update',
            path: `/stories/${storyId}/plugins`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * download a zip of the story
     *
     * @param storyId storyId
     * @param callerOptions
     */
    downloadZip$(
        storyId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/stories/${storyId}/download-zip`,
            storyId,
            {},
            callerOptions,
        )
    }
}
