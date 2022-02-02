/** @format */

import { CallerRequestOptions } from '../utils'
import { RootRouter } from '../router'
import { HealthzResponse } from './interfaces'
import { ApplicationsRouter } from './routers'

export class CdnSessionsStorageClient extends RootRouter {
    applications: ApplicationsRouter

    constructor({
        headers,
    }: {
        headers?: { [_key: string]: string }
    } = {}) {
        super({
            basePath: '/api/cdn-sessions-storage',
            headers,
        })

        this.applications = new ApplicationsRouter(this)
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$(callerOptions: CallerRequestOptions = {}) {
        return this.send$<HealthzResponse>({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }
}
