import {
    CallerRequestOptions,
    downloadBlob,
    HTTPError,
    HTTPResponse$,
} from '../utils'
import {
    PostFileResponse,
    PostMetadataBody,
    PostMetadataResponse,
    RemoveResponse,
    GetInfoResponse,
} from './interfaces'
import { RootRouter } from '../router'
import { Observable } from 'rxjs'
import { NewAssetResponse } from '../assets-gateway'

export class FilesClient extends RootRouter {
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
     * Publish a story from a .zip file
     *
     * @param dataDescription string
     * @param dataDescription.fileName filename
     * @param dataDescription.blob Blob content of the zip file
     * @param dataDescription.fileId optional fileId
     * @param folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return file response or asset depending on whether the client is used through assets-gtw
     */
    upload$(
        dataDescription: {
            fileName: string
            blob: Blob
            fileId?: string
        },
        folderId?: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<NewAssetResponse<PostFileResponse> | PostFileResponse> {
        const suffix = folderId ? `?folder-id=${folderId}` : ''
        const file = new File(
            [dataDescription.blob],
            dataDescription.fileName,
            {
                type: dataDescription.blob.type,
            },
        )
        const formData = new FormData()
        formData.append('file', file)
        formData.append('file_id', dataDescription.fileId)
        formData.append('file_name', dataDescription.fileName)

        return this.sendFormData$({
            command: 'upload',
            path: `/files${suffix}`,
            formData: formData,
            callerOptions,
        }) as Observable<
            NewAssetResponse<PostFileResponse> | PostFileResponse | HTTPError
        >
    }

    /**
     * Get a specific file statistics info.
     *
     * @param fileId
     * @param callerOptions
     */
    getInfo$(
        fileId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetInfoResponse> {
        return this.send$({
            command: 'query',
            path: `/files/${fileId}/info`,
            callerOptions,
        })
    }

    /**
     * Get a specific file statistics info.
     *
     * @param fileId
     * @param body metadata fields
     * @param callerOptions
     */
    updateMetadata$(
        fileId: string,
        body: PostMetadataBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<PostMetadataResponse> {
        return this.send$({
            command: 'update',
            path: `/files/${fileId}/metadata`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Get a file.
     *
     * @param fileId
     * @param callerOptions
     */
    get$(
        fileId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/files/${fileId}`,
            fileId,
            {},
            callerOptions,
        ) as Observable<Blob>
    }

    /**
     * Remove a file.
     *
     * @param fileId
     * @param callerOptions
     */
    remove$(
        fileId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<RemoveResponse> {
        return this.send$({
            command: 'delete',
            path: `/files/${fileId}`,
            callerOptions,
        })
    }
}
