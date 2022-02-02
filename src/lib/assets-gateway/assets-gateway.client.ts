/** @format */

import { Observable } from 'rxjs'
import { GroupsResponse, HealthzResponse, UserInfoResponse } from './interfaces'
import { CallerRequestOptions, HTTPError } from '../utils'
import { AssetsRouter, ExplorerRouter, RawRouter } from './routers'
import { RootRouter } from '../router'

export class AssetsGatewayClient extends RootRouter {
    public readonly explorer: ExplorerRouter
    public readonly assets: AssetsRouter
    public readonly raw: RawRouter

    constructor({
        headers,
    }: {
        headers?: { [_key: string]: string }
    } = {}) {
        super({
            basePath: '/api/assets-gateway',
            headers,
        })
        this.explorer = new ExplorerRouter(this)
        this.assets = new AssetsRouter(this)
        this.raw = new RawRouter(this)
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$(
        callerOptions: CallerRequestOptions = {},
    ): Observable<HealthzResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }

    /**
     * User infos
     *
     * @param callerOptions
     * @returns response
     */
    getUserInfo$(
        callerOptions: CallerRequestOptions = {},
    ): Observable<UserInfoResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/user-info`,
            callerOptions,
        })
    }

    /**
     * Groups in which the user belong
     * @param callerOptions
     * @returns response
     */
    queryGroups(
        callerOptions: CallerRequestOptions = {},
    ): Observable<GroupsResponse | HTTPError> {
        return this.send$({
            command: 'query',
            path: `/groups`,
            callerOptions,
        })
    }
}
