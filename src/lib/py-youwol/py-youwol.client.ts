/** @format */

import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import { RootRouter } from '../router'
import { HealthzResponse } from './interfaces'
import { AdminRouter } from './routers/admin.router'

export class PyYouwolClient extends RootRouter {
    public readonly admin: AdminRouter

    constructor({
        headers,
    }: {
        headers?: { [_key: string]: string }
    } = {}) {
        super({
            basePath: '',
            headers,
        })
        this.admin = new AdminRouter(this)
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<HealthzResponse> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }
}
