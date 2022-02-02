/** @format */

import { Router } from '../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../utils'

export class AdminRouter extends Router {
    public readonly customCommands: CustomCommandsRouter

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/admin`)
        this.customCommands = new CustomCommandsRouter(this)
    }
}

export class CustomCommandsRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/custom-commands`)
    }

    /**
     *
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
}
