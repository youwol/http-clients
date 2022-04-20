import { RootRouter } from '../router'
import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import { GroupsResponse, HealthzResponse, UserInfoResponse } from './interfaces'
import { AssetsRouter, ExplorerRouter, RawRouter, MiscRouter } from './routers'
import { CdnClient } from '../cdn-backend'
import { StoriesClient } from '../stories-backend'
import { FilesClient } from '../files-backend'
import { FluxClient } from '../flux-backend'
import { TreedbClient } from '../treedb-backend'

export class AssetsGatewayClient extends RootRouter {
    public readonly explorer: ExplorerRouter
    public readonly assets: AssetsRouter
    public readonly raw: RawRouter
    public readonly misc: MiscRouter
    public readonly cdn: CdnClient
    public readonly stories: StoriesClient
    public readonly files: FilesClient
    public readonly flux: FluxClient
    public readonly treedb: TreedbClient

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
        this.stories = new StoriesClient({
            headers,
            basePath: `/api/assets-gateway/stories-backend`,
        })
        this.files = new FilesClient({
            headers,
            basePath: `/api/assets-gateway/files-backend`,
        })
        this.flux = new FluxClient({
            headers,
            basePath: `/api/assets-gateway/flux-backend`,
        })
        this.treedb = new TreedbClient({
            headers,
            basePath: `/api/assets-gateway/treedb-backend`,
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
