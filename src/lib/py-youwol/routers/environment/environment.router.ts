import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import {
    EnvironmentStatusResponse,
    LoginResponse,
    QueryCustomDispatchesResponse,
} from './interfaces'

class WebSocketAPI {
    constructor(public readonly ws$: () => WebSocketResponse$<unknown>) {}

    status$(
        filters: { profile?: string } = {},
    ): WebSocketResponse$<EnvironmentStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<EnvironmentStatusResponse>({
                withLabels: ['EnvironmentStatusResponse'],
                withAttributes: filters,
            }),
        )
    }
}

export class EnvironmentRouter extends Router {
    public readonly webSocket: WebSocketAPI

    constructor(parent: Router, ws$: () => WebSocketResponse$<unknown>) {
        super(parent.headers, `${parent.basePath}/environment`)
        this.webSocket = new WebSocketAPI(ws$)
    }

    /**
     * Login as user
     *
     * @param body
     * @param body.email user's email
     * @param callerOptions
     */
    login$(
        body: { email: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<LoginResponse> {
        return this.send$({
            command: 'upload',
            path: `/login`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Status
     *
     * @param callerOptions
     */
    status$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<EnvironmentStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/status`,
            callerOptions,
        })
    }

    switchProfile$(
        body: { active: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<EnvironmentStatusResponse> {
        return this.send$({
            command: 'update',
            path: `/configuration/profiles/active`,
            nativeRequestOptions: {
                method: 'PUT',
                json: body,
            },
            callerOptions,
        })
    }

    reloadConfig$(callerOptions: CallerRequestOptions = {}) {
        return this.send$({
            command: 'update',
            path: `/configuration`,
            nativeRequestOptions: {
                method: 'POST',
            },
            callerOptions,
        })
    }

    queryCustomDispatches$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<QueryCustomDispatchesResponse> {
        return this.send$({
            command: 'query',
            path: `/configuration/custom-dispatches`,
            callerOptions,
        })
    }

    queryCowSay$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<string> {
        return this.send$({
            command: 'query',
            path: `/cow-say`,
            callerOptions,
        })
    }

    getFileContent$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<string> {
        return this.send$({
            command: 'query',
            path: `/configuration/config-file`,
            callerOptions,
        })
    }
}
