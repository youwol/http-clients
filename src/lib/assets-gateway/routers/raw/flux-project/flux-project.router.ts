import { RawId } from '../../..'
import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../../utils'
import { Project } from './interfaces'

export class RawFluxProjectRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/flux-project`)
    }

    /**
     * Get a flux project.
     *
     * @param rawId
     * @param callerOptions
     */
    getProject$(
        rawId: RawId,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Project> {
        return this.send$({
            command: 'query',
            path: `/${rawId}`,
            callerOptions,
        })
    }

    /**
     * Update metadata of a flux project.
     *
     * @param rawId
     * @param body
     * @param callerOptions
     */
    updateMetadata$(
        rawId: string,
        body: {
            name?: string
            description?: string
            libraries?: { [_k: string]: string }
        },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Record<string, never>> {
        return this.send$({
            command: 'update',
            path: `/${rawId}/metadata`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }
}
