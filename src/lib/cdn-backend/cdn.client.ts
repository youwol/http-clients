import {
    CallerRequestOptions,
    downloadBlob,
    HTTPResponse$,
    uploadBlob,
} from '../utils'
import {
    GetHealthzResponse,
    QueryExplorerResponse,
    UploadResponse,
    GetLibraryInfoResponse,
    DeleteLibraryResponse,
    GetVersionInfoResponse,
    UploadBody,
} from './interfaces'
import { RootRouter } from '../router'
import { NewAssetResponse } from '../assets-gateway'
import { Observable } from 'rxjs'

export class CdnClient extends RootRouter {
    constructor({
        headers,
        basePath,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
    } = {}) {
        super({
            basePath: basePath || '/api/cdn-backend',
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
    }): HTTPResponse$<GetHealthzResponse> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }

    /**
     * Retrieve package's info
     *
     * @param libraryId
     * @param callerOptions
     */
    getLibraryInfo$({
        libraryId,
        callerOptions,
    }: {
        libraryId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetLibraryInfoResponse> {
        return this.send$({
            command: 'query',
            path: `/libraries/${libraryId}`,
            callerOptions,
        })
    }

    /**
     * Retrieve version info of a library
     *
     * @param libraryId
     * @param version
     * @param callerOptions
     */
    getVersionInfo$({
        libraryId,
        version,
        callerOptions,
    }: {
        libraryId: string
        version: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetVersionInfoResponse> {
        return this.send$({
            command: 'query',
            path: `/libraries/${libraryId}/${version}`,
            callerOptions,
        })
    }

    /**
     * Delete library & all the versions published
     * @param libraryId
     * @param callerOptions
     */
    deleteLibrary$({
        libraryId,
        callerOptions,
    }: {
        libraryId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteLibraryResponse> {
        return this.send$({
            command: 'delete',
            path: `/libraries/${libraryId}`,
            callerOptions,
        })
    }

    /**
     * Get entry point of a library.
     *
     * @param libraryId
     * @param version
     * @param callerOptions
     */
    getEntryPoint$({
        libraryId,
        version,
        callerOptions,
    }: {
        libraryId: string
        version: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
        return this.send$({
            command: 'query',
            path: `/resources/${libraryId}/${version}`,
            callerOptions,
        })
    }

    /**
     * Get a resource from the CDN.
     *
     * @param libraryId
     * @param version
     * @param restOfPath
     * @param callerOptions
     */
    getResource$<TResp = Blob>({
        libraryId,
        version,
        callerOptions,
        restOfPath,
    }: {
        libraryId: string
        version: string
        restOfPath: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<TResp> {
        return this.send$({
            command: 'query',
            path: `/resources/${libraryId}/${version}/${restOfPath}`,
            callerOptions,
        })
    }

    /**
     * Download a library
     *
     * @param libraryId
     * @param version
     * @param callerOptions
     * @return blob of the library's zip file
     */
    downloadLibrary$({
        libraryId,
        version,
        callerOptions,
    }: {
        libraryId: string
        version: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/download-library/${libraryId}/${version}`,
            'library',
            {},
            callerOptions,
        ) as Observable<Blob>
    }

    /**
     * Upload a zip file of a CDN package.
     *
     * @param body
     * @param body.fileName string
     * @param body.blob Blob content of the zip file
     * @param queryParameters
     * @param queryParameters.folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return package response or asset depending on whether the client is used through assets-gtw
     */
    upload$({
        body,
        queryParameters,
        callerOptions,
    }: {
        body: UploadBody
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<NewAssetResponse<UploadResponse> | UploadResponse> {
        const suffix =
            queryParameters && queryParameters.folderId
                ? `?folder-id=${queryParameters.folderId}`
                : ''
        return uploadBlob(
            `${this.basePath}/publish-library${suffix}`,
            body.fileName,
            'POST',
            body.blob,
            {},
            callerOptions,
        ) as HTTPResponse$<NewAssetResponse<UploadResponse> | UploadResponse>
    }

    /**
     * Get items content of a folder in the CDN
     *
     * @param libraryName base64 encoded library's name
     * @param version version of the library
     * @param restOfPath path of the folder
     * @param callerOptions
     */
    queryExplorer$({
        libraryId,
        version,
        restOfPath,
        callerOptions,
    }: {
        libraryId: string
        version: string
        restOfPath: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<QueryExplorerResponse> {
        return this.send$({
            command: 'query',
            path: `/explorer/${libraryId}/${version}/${restOfPath}`,
            callerOptions,
        })
    }
}
