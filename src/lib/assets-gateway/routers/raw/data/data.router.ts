/** @format */

import { Router } from '../../../../router'

import {
    CallerRequestOptions,
    downloadBlob,
    HTTPResponse$,
} from '../../../../utils'

export class RawDataRouter extends Router {
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
    ): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/${itemId}`,
            itemId,
            {},
            callerOptions,
        )
    }
}
