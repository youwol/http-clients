import { map } from 'rxjs/operators'
import { AccountsClient } from '../accounts-backend'
import { AssetsClient } from '../assets-backend'
import { CdnClient } from '../cdn-backend'
import { ExplorerClient } from '../explorer-backend'
import { FilesClient } from '../files-backend'
import { FluxClient } from '../flux-backend'
import { StoriesClient } from '../stories-backend'
import {
    CallerRequestOptions,
    HTTPResponse$,
    RootRouter,
    HTTPError,
} from '@youwol/http-primitives'
import {
    GetHealthzResponse,
    GetUserInfoResponse,
    QueryGroupsResponse,
} from './interfaces'
import { MiscRouter } from './routers'

export class AssetsGatewayClient extends RootRouter {
    public readonly misc: MiscRouter
    public readonly cdn: CdnClient
    public readonly stories: StoriesClient
    public readonly files: FilesClient
    public readonly flux: FluxClient
    public readonly explorer: ExplorerClient
    public readonly assets: AssetsClient
    public readonly accounts: AccountsClient

    constructor({
        headers,
        hostName,
    }: {
        headers?: { [_key: string]: string }
        hostName?: string
    } = {}) {
        super({
            basePath: '/api/assets-gateway',
            headers,
            hostName,
        })
        this.misc = new MiscRouter(this)
        this.cdn = new CdnClient({
            headers,
            basePath: `/api/assets-gateway/cdn-backend`,
            hostName,
        })
        this.stories = new StoriesClient({
            headers,
            basePath: `/api/assets-gateway/stories-backend`,
            hostName,
        })
        this.files = new FilesClient({
            headers,
            basePath: `/api/assets-gateway/files-backend`,
            hostName,
        })
        this.flux = new FluxClient({
            headers,
            basePath: `/api/assets-gateway/flux-backend`,
            hostName,
        })
        this.explorer = new ExplorerClient({
            headers,
            basePath: `/api/assets-gateway/treedb-backend`,
            hostName,
        })
        this.assets = new AssetsClient({
            headers,
            basePath: `/api/assets-gateway/assets-backend`,
            hostName,
        })
        this.accounts = new AccountsClient({
            headers,
            hostName,
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
    ): HTTPResponse$<GetHealthzResponse> {
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
     *
     * @deprecated Use AccountsClient.getSessionDetails$().userInfo instead
     */
    getUserInfo$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetUserInfoResponse> {
        return this.accounts
            .getSessionDetails$(callerOptions)
            .pipe(
                map((resp) =>
                    resp instanceof HTTPError ? resp : resp.userInfo,
                ),
            )
    }

    /**
     * Groups in which the user belong
     * @param callerOptions
     * @returns response
     *
     * @deprecated Use AccountsClient.getSessionDetails$().userInfo.groups instead
     *
     */
    queryGroups$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<QueryGroupsResponse> {
        return this.accounts
            .getSessionDetails$(callerOptions)
            .pipe(
                map((resp) =>
                    resp instanceof HTTPError
                        ? resp
                        : { groups: resp.userInfo.groups },
                ),
            )
    }
}
