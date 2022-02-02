/** @format */

import { Observable } from 'rxjs'
import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPError, uploadBlob } from '../../../../utils'
import { Asset } from '../interfaces'

export class DataRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/data`)
    }

    /**
     * Upload file in YouWol.
     *
     * @param folderId Location of the uploaded data
     * @param fileName file's name
     * @param blob file's content
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
