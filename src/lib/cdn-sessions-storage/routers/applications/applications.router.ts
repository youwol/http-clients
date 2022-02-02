/** @format */

import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$, Json } from '../../../utils'

export class ApplicationsRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/applications`)
    }

    /**
     * Post data
     *
     * @param packageName name of the cdn package
     * @param dataName name of the data
     * @param body json data-structure to save
     * @param callerOptions
     * @returns response
     */
    postData$(
        packageName: string,
        dataName: string,
        body: Json,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Record<string, never>> {
        return this.send$({
            command: 'upload',
            path: `/${packageName}/${dataName}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Get data
     *
     * @param packageName name of the cdn package
     * @param dataName name of the data
     * @param callerOptions
     * @returns response
     */
    getData$(
        packageName: string,
        dataName: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Json> {
        return this.send$({
            command: 'download',
            path: `/${packageName}/${dataName}`,
            callerOptions,
        })
    }
}
