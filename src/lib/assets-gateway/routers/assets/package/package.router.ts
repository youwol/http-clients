/** @format */

import { Observable } from 'rxjs'
import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPError, uploadBlob } from '../../../../utils'
import { Asset } from '../interfaces'

export class PackageRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/package`)
    }

    /**
     * Upload a zip file of a CDN package.
     *
     * @param folderId destination folder id
     * @param fileName name of the zip file
     * @param blob Blob content of the zip file
     * @param callerOptions
     */
    upload$(
        folderId: string,
        fileName: string,
        blob: Blob,
        callerOptions: CallerRequestOptions = {},
    ): Observable<Asset | HTTPError> {
        return uploadBlob(
            `${this.basePath}/location/${folderId}`,
            fileName,
            'PUT',
            blob,
            {},
            callerOptions,
        ) as Observable<Asset | HTTPError>
    }
}
