/** @format */

import { Observable } from 'rxjs'
import { RawId } from '../../..'
import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPError } from '../../../../utils'
import { Project } from './interfaces'

export class FluxProjectRouter extends Router {
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
    ): Observable<Project | HTTPError> {
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
            libraries?: Record<string, string>
        },
        callerOptions: CallerRequestOptions = {},
    ): Observable<Record<string, never> | HTTPError> {
        return this.send$({
            command: 'update',
            path: `/${rawId}/metadata`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }
}
