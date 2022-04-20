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
    getHealthz$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<HealthzResponse> {
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
     * @param queryParameters
     * @param queryParameters.folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return story response or asset depending on whether the client is used through assets-gtw
     */
    create$({
        body,
        queryParameters,
        callerOptions,
    }: {
        body: { storyId?: string; title: string }
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Asset | StoryResponse> {
        const suffix =
            queryParameters && queryParameters.folderId
                ? `?folder-id=${queryParameters.folderId}`
                : ''
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
     * @param body
     * @param body.fileName string
     * @param body.blob Blob content of the zip file
     * @param queryParameters
     * @param queryParameters.folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return story response or asset depending on whether the client is used through assets-gtw
     */
    publish$({
        body,
        queryParameters,
        callerOptions,
    }: {
        body: {
            fileName: string
            blob: Blob
        }
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Asset | StoryResponse> {
        const suffix =
            queryParameters && queryParameters.folderId
                ? `?folder-id=${queryParameters.folderId}`
                : ''
        return uploadBlob(
            `${this.basePath}/stories${suffix}`,
            body.fileName,
            'POST',
            body.blob,
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
    getStory$({
        storyId,
        callerOptions,
    }: {
        storyId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<StoryResponse> {
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
    deleteStory$({
        storyId,
        callerOptions,
    }: {
        storyId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteStoryResponse> {
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
    getGlobalContents$({
        storyId,
        callerOptions,
    }: {
        storyId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetGlobalContentResponse> {
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
    getDocument$({
        storyId,
        documentId,
        callerOptions,
    }: {
        storyId: string
        documentId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DocumentResponse> {
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
    updateGlobalContents$({
        storyId,
        body,
        callerOptions,
    }: {
        storyId: string
        body: PostGlobalContentBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<{}> {
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
    createDocument$({
        storyId,
        body,
        callerOptions,
    }: {
        storyId: string
        body: {
            parentDocumentId: string
            title: string
            content?: DocumentContentBody
        }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DocumentResponse> {
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
    updateDocument$({
        storyId,
        documentId,
        body,
        callerOptions,
    }: {
        storyId: string
        documentId: string
        body: UpdateDocumentBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DocumentResponse> {
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
    getContent$({
        storyId,
        documentId,
        callerOptions,
    }: {
        storyId: string
        documentId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DocumentContentResp> {
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
    updateContent$({
        storyId,
        documentId,
        body,
        callerOptions,
    }: {
        storyId: string
        documentId: string
        body: DocumentContentBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<boolean> {
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
    deleteDocument$({
        storyId,
        documentId,
        callerOptions,
    }: {
        storyId: string
        documentId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteDocumentResponse> {
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
     * @param queryParameters
     * @param queryParameters.fromIndex starting children document's index
     * @param queryParameters.count number of document returned after start at fromIndex (included)
     * @param callerOptions
     */
    queryDocuments$({
        storyId,
        parentDocumentId,
        queryParameters,
        callerOptions,
    }: {
        storyId: string
        parentDocumentId: string
        queryParameters?: {
            fromIndex?: number
            count?: number
        }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DocumentsResponse> {
        const fromIndex =
            queryParameters && queryParameters.fromIndex
                ? queryParameters.fromIndex
                : 0
        const count =
            queryParameters && queryParameters.count
                ? queryParameters.count
                : 1000

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
    moveDocument$({
        storyId,
        documentId,
        body,
        callerOptions,
    }: {
        storyId: string
        documentId: string
        body: MoveDocumentBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<MoveDocumentResponse> {
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
    addPlugin$({
        storyId,
        body,
        callerOptions,
    }: {
        storyId: string
        body: AddPluginBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<PostPluginResponse> {
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
    downloadZip$({
        storyId,
        callerOptions,
    }: {
        storyId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/stories/${storyId}/download-zip`,
            storyId,
            {},
            callerOptions,
        )
    }
}
