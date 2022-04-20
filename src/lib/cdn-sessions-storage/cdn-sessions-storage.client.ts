import { RootRouter } from '../router'
import { CallerRequestOptions, HTTPResponse$, Json } from '../utils'
import { HealthzResponse } from './interfaces'

export class CdnSessionsStorageClient extends RootRouter {
    constructor({
        headers,
    }: {
        headers?: { [_key: string]: string }
    } = {}) {
        super({
            basePath: '/api/cdn-sessions-storage',
            headers,
        })
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<HealthzResponse> {
        return this.send$<HealthzResponse>({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
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
    postData$({
        packageName,
        dataName,
        body,
        callerOptions,
    }: {
        packageName: string
        dataName: string
        body: Json
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Record<string, never>> {
        return this.send$({
            command: 'upload',
            path: `/applications/${packageName}/${dataName}`,
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
    getData$({
        packageName,
        dataName,
        callerOptions,
    }: {
        packageName: string
        dataName: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Json> {
        return this.send$({
            command: 'download',
            path: `/applications/${packageName}/${dataName}`,
            callerOptions,
        })
    }
}
