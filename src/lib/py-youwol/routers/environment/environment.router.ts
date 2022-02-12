/** @format */

import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { EnvironmentStatusResponse, LoginResponse } from './interfaces'
import { ContextMessage$, filterCtxMessage } from '../../../ws-utils'

class WebSocketAPI {
    constructor(public readonly ws$: () => ContextMessage$<unknown>) {}

    status$(
        filters: { profile?: string } = {},
    ): ContextMessage$<EnvironmentStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<EnvironmentStatusResponse>({
                withLabels: ['EnvironmentStatusResponse'],
                withAttributes: filters,
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
}
