import { Subject } from 'rxjs'
import { RootRouter } from '../router'
import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import { ContextMessage, HealthzResponse } from './interfaces'
import { AdminRouter } from './routers/admin.router'

export class PyYouwolClient extends RootRouter {
    public readonly admin: AdminRouter

    static ws$: Subject<ContextMessage>

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
        if (PyYouwolClient.ws$) {
            return PyYouwolClient.ws$
        }
        const path = window.location.host
        PyYouwolClient.ws$ = this.connectWs(`ws://${path}/ws`)
        return PyYouwolClient.ws$
    }

    private connectWs(path: string) {
        const channel$ = new Subject<ContextMessage>()
        const ws = new WebSocket(path)
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            channel$.next(data)
        }
        return channel$
    }
}
