/** @format */

import { Observable } from 'rxjs'
import { Router } from '../../../../router'

import {
    CallerRequestOptions,
    downloadBlob,
    HTTPError,
} from '../../../../utils'

export class DataRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/data`)
    }

    /**
     * Download data from YouWol
     *
     * @param itemId
     * @param callerOptions
     */
    download$(
        itemId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<Blob | HTTPError> {
        return downloadBlob(
            `${this.basePath}/${itemId}`,
            itemId,
            {},
            callerOptions,
        )
    }
}
