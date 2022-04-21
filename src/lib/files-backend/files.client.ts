import {
    CallerRequestOptions,
    downloadBlob,
    HTTPError,
    HTTPResponse$,
} from '../utils'
import {
    UploadResponse,
    PostMetadataBody,
    UpdateMetadataResponse,
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
     * @param body
     * @param body.fileName filename
     * @param body.blob Blob content of the zip file
     * @param body.fileId optional fileId
     * @param queryParameters
     * @param queryParameters.folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return file response or asset depending on whether the client is used through assets-gtw
     */
    upload$({
        body,
        queryParameters,
        callerOptions,
    }: {
        body: {
            fileName: string
            fileId?: string
            content: Blob | File
        }
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<NewAssetResponse<UploadResponse> | UploadResponse> {
        const suffix = queryParameters.folderId
            ? `?folder-id=${queryParameters.folderId}`
            : ''
        const content = body.content
        const file =
            content instanceof Blob
                ? new File([content], body.fileName, {
                      type: content.type,
                  })
                : content

        const formData = new FormData()
        formData.append('file', file)
        body.fileId && formData.append('file_id', body.fileId)
        formData.append('file_name', body.fileName)

        return this.sendFormData$({
            command: 'upload',
            path: `/files${suffix}`,
            formData: formData,
            callerOptions,
        }) as Observable<
            NewAssetResponse<UploadResponse> | UploadResponse | HTTPError
        >
    }

    /**
     * Get a specific file statistics info.
     *
     * @param fileId
     * @param callerOptions
     */
    getInfo$({
        fileId,
        callerOptions,
    }: {
        fileId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetInfoResponse> {
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
    updateMetadata$({
        fileId,
        body,
        callerOptions,
    }: {
        fileId: string
        body: PostMetadataBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpdateMetadataResponse> {
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
    get$({
        fileId,
        callerOptions,
    }: {
        fileId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
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
    remove$({
        fileId,
        callerOptions,
    }: {
        fileId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<RemoveResponse> {
        return this.send$({
            command: 'delete',
            path: `/files/${fileId}`,
            callerOptions,
        })
    }
}
