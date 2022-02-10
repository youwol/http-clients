/** @format */

import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { EnvironmentStatusResponse, LoginResponse } from './interfaces'
import { ContextMessage$, filterCtxMessage } from '../../../ws-utils'

class WebSocketAPI {
    constructor(public readonly ws$: () => ContextMessage$<unknown>) {}

    status$(): ContextMessage$<EnvironmentStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<EnvironmentStatusResponse>({
                withLabels: ['EnvironmentStatusResponse'],
            }),
        )
    }
}

export class EnvironmentRouter extends Router {
    webSocket: WebSocketAPI

    constructor(parent: Router, ws$: () => ContextMessage$<unknown>) {
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
}
