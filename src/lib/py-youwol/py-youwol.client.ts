/** @format */

import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import { RootRouter } from '../router'
import { ContextMessage, HealthzResponse } from './interfaces'
import { AdminRouter } from './routers/admin.router'
import { Subject } from 'rxjs'

export class PyYouwolClient extends RootRouter {
    public readonly admin: AdminRouter
    private ws$: Subject<ContextMessage>

    constructor({
        headers,
    }: {
        headers?: { [_key: string]: string }
    } = {}) {
        super({
            basePath: '',
            headers,
        })
        this.admin = new AdminRouter(this, () => this.webSocket$())
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

    webSocket$() {
        if (this.ws$) {
            return this.ws$
        }
        const path = window.location.host
        this.ws$ = this.connectWs(`ws://${path}/ws`)
        return this.ws$
    }

    private connectWs(path: string) {
        const channel$ = new Subject<ContextMessage>()
        const ws = new WebSocket(path)
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (event.data != {}) {
                channel$.next(data)
            }
        }
        return channel$
    }
}
