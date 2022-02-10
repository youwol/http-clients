/** @format */

import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$, Json } from '../../../utils'

export class CustomCommandsRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/custom-commands`)
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
