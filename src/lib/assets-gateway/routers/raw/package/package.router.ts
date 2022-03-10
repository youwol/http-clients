import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../../utils'
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
    ): HTTPResponse$<MetadataResponse> {
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
    ): HTTPResponse$<Blob> {
        return this.send$({
            command: 'query',
            path: `/${rawId}/${restOfPath}`,
            callerOptions,
        })
    }
}
