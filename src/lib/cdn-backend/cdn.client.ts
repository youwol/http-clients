import {
    CallerRequestOptions,
    downloadBlob,
    HTTPError,
    HTTPResponse$,
    uploadBlob,
} from '../utils'
import {
    HealthzResponse,
    ExplorerResponse,
    PublishResponse,
    LibraryInfoResponse,
    DeleteLibraryResponse,
} from './interfaces'
import { RootRouter } from '../router'
import { Asset } from '../assets-gateway'
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
     * Retrieve package's info
     *
     * @param libraryId
     * @param callerOptions
     */
    getLibraryInfo$(
        libraryId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<LibraryInfoResponse> {
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
    getVersionInfo$(
        libraryId: string,
        version: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<LibraryInfoResponse> {
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
    deleteLibrary$(
        libraryId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<DeleteLibraryResponse> {
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
    getEntryPoint$(
        libraryId: string,
        version: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Blob> {
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
    getResource$(
        libraryId: string,
        version: string,
        restOfPath: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Blob> {
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
    downloadLibrary(
        libraryId: string,
        version: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Blob> {
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
     * @param fileName string
     * @param blob Blob content of the zip file
     * @param folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return package response or asset depending on whether the client is used through assets-gtw
     */
    upload$(
        fileName: string,
        blob: Blob,
        folderId?: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset | PublishResponse> {
        const suffix = folderId ? `?folder-id=${folderId}` : ''
        return uploadBlob(
            `${this.basePath}/publish-library${suffix}`,
            fileName,
            'POST',
            blob,
            {},
            callerOptions,
        ) as Observable<Asset | HTTPError>
    }

    /**
     * Get items content of a folder in the CDN
     *
     * @param libraryName base64 encoded library's name
     * @param version version of the library
     * @param restOfPath path of the folder
     * @param callerOptions
     */
    queryExplorer$(
        libraryName: string,
        version: string,
        restOfPath: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<ExplorerResponse> {
        return this.send$({
            command: 'query',
            path: `/explorer/${libraryName}/${version}/${restOfPath}`,
            callerOptions,
        })
    }
}
