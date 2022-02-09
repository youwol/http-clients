/** @format */

import { Router } from '../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../utils'
import { LoginResponse } from '../interfaces'

export class AdminRouter extends Router {
    public readonly customCommands: CustomCommandsRouter
    public readonly environment: EnvironmentRouter

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/admin`)
        this.customCommands = new CustomCommandsRouter(this)
        this.environment = new EnvironmentRouter(this)
    }
}

export class EnvironmentRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/environment`)
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
