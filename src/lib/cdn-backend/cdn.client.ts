import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import { HealthzResponse, ExplorerResponse } from './interfaces'
import { RootRouter } from '../router'

export class CdnClient extends RootRouter {
    constructor({
        headers,
        basePath,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
    } = {}) {
        super({
            basePath: basePath || '/api/cdn-backend',
            headers,
        })
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

    /**
     * Get items content of a folder in the CDN
     *
     * @param libraryName base64 encoded library's name
     * @param version version of the library
     * @param restOfPath path of the folder
     * @param callerOptions
     */
    queryExplorer$(
        libraryName: string,
        version: string,
        restOfPath: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<ExplorerResponse> {
        return this.send$({
            command: 'query',
            path: `/explorer/${libraryName}/${version}/${restOfPath}`,
            callerOptions,
        })
    }
}
