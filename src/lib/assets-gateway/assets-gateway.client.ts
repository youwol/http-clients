import { RootRouter } from '../router'
import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import { GroupsResponse, HealthzResponse, UserInfoResponse } from './interfaces'
import { AssetsRouter, ExplorerRouter, RawRouter, MiscRouter } from './routers'
import { CdnClient } from '../cdn-backend'

export class AssetsGatewayClient extends RootRouter {
    public readonly explorer: ExplorerRouter
    public readonly assets: AssetsRouter
    public readonly raw: RawRouter
    public readonly misc: MiscRouter
    public readonly cdn: CdnClient

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
        this.misc = new MiscRouter(this)
        this.cdn = new CdnClient({
            headers,
            basePath: `/api/assets-gateway/cdn-backend`,
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
     * User infos
     *
     * @param callerOptions
     * @returns response
     */
    getUserInfo$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<UserInfoResponse> {
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
    ): HTTPResponse$<GroupsResponse> {
        return this.send$({
            command: 'query',
            path: `/groups`,
            callerOptions,
        })
    }
}
