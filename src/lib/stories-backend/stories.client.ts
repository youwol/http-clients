import {
    CallerRequestOptions,
    downloadBlob,
    HTTPError,
    HTTPResponse$,
    uploadBlob,
} from '../utils'
import {
    GetGlobalContentResponse,
    GetHealthzResponse,
    MoveDocumentBody,
    MoveDocumentResponse,
    UpdateGlobalContentBody,
    GetDocumentResponse,
    GetContentResponse,
    AddPluginResponse,
    AddPluginBody,
    UpdateDocumentBody,
    DeleteDocumentResponse,
    DeleteStoryResponse,
    CreateStoryResponse,
    PublishStoryResponse,
    GetStoryResponse,
    UpdateGlobalContentsResponse,
    CreateDocumentResponse,
    UpdateDocumentResponse,
    UpdateContentsResponse,
    QueryDocumentsResponse,
    UpdateContentBody,
    CreateBody,
    PublishBody,
    CreateDocumentBody,
    UpgradePluginsBody,
    UpgradePluginsResponse,
} from './interfaces'
import { RootRouter } from '../router'
import { Observable } from 'rxjs'
import { NewAssetResponse } from '../assets-gateway'

export class StoriesClient extends RootRouter {
    constructor({
        headers,
        basePath,
        hostName,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
        hostName?: string
    } = {}) {
        super({
            basePath: basePath || '/api/stories-backend',
            headers,
            hostName,
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
    } = {}): HTTPResponse$<GetHealthzResponse> {
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
        body: CreateBody
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<
        NewAssetResponse<CreateStoryResponse> | CreateStoryResponse
    > {
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
        body: PublishBody
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<
        NewAssetResponse<PublishStoryResponse> | PublishStoryResponse
    > {
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
    }): HTTPResponse$<GetStoryResponse> {
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
    }): HTTPResponse$<GetDocumentResponse> {
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
        body: UpdateGlobalContentBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpdateGlobalContentsResponse> {
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
        body: CreateDocumentBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<CreateDocumentResponse> {
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
    }): HTTPResponse$<UpdateDocumentResponse> {
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
    }): HTTPResponse$<GetContentResponse> {
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
        body: UpdateContentBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpdateContentsResponse> {
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
    }): HTTPResponse$<QueryDocumentsResponse> {
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
    }): HTTPResponse$<AddPluginResponse> {
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
     * upgrade the plugins of a story
     *
     * @param storyId storyId
     * @param body body
     * @param callerOptions
     */
    upgradePlugins$({
        storyId,
        body,
        callerOptions,
    }: {
        storyId: string
        body: UpgradePluginsBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpgradePluginsResponse> {
        return this.send$({
            command: 'update',
            path: `/stories/${storyId}/plugins/upgrade`,
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
