/** @format */

import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPError } from '../../../../utils'
import { Observable } from 'rxjs'
import { MetadataResponse } from './interface'

export class RawPackageRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/package`)
    }

    /**
     * Retrieve package's metadata
     *
     * @param rawId
     * @param callerOptions
     */
    getMetadata$(
        rawId: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<MetadataResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/metadata/${rawId}`,
            callerOptions,
        })
    }

    /**
     * Get a resource from the CDN.
     *
     * @param rawId
     * @param restOfPath
     * @param callerOptions
     */
    getResource$(
        rawId: string,
        restOfPath: string,
        callerOptions: CallerRequestOptions = {},
    ): Observable<unknown | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/${rawId}/${restOfPath}`,
            callerOptions,
        })
    }
}
