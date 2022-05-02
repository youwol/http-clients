import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$, Json } from '../../../utils'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import { WsRouter } from '../../py-youwol.client'

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

class WebSocketAPI {
    constructor(public readonly ws: WsRouter) {}

    log$(
        filters: { commandName?: string; method?: Method } = {},
    ): WebSocketResponse$<unknown> {
        return this.ws.log$.pipe(
            filterCtxMessage<unknown>({
                withAttributes: { ...filters, topic: 'commands' },
            }),
        )
    }
}

export class CustomCommandsRouter extends Router {
    public readonly webSocket: WebSocketAPI

    constructor(parent: Router, ws: WsRouter) {
        super(parent.headers, `${parent.basePath}/custom-commands`)
        this.webSocket = new WebSocketAPI(ws)
    }

    /**
     * Execute a command using GET request
     * @param name name of the command
     * @param callerOptions
     */
    doGet$(
        name: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<unknown> {
        return this.send$({
            command: 'query',
            path: `/${name}`,
            callerOptions,
        })
    }

    /**
     * Execute a command using POST request
     * @param name name of the command
     * @param body body of the request
     * @param callerOptions
     */
    doPost$(
        name: string,
        body: Json,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<unknown> {
        return this.send$({
            command: 'update',
            path: `/${name}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Execute a command using PUT request
     * @param name name of the command
     * @param body body of the request
     * @param callerOptions
     */
    doPut$(
        name: string,
        body: Json,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<unknown> {
        return this.send$({
            command: 'create',
            path: `/${name}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Execute a command using DELETE request
     * @param name name of the command
     * @param callerOptions
     */
    doDelete$(
        name: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<unknown> {
        return this.send$({
            command: 'delete',
            path: `/${name}`,
            callerOptions,
        })
    }
}
