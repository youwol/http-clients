import { Subject } from 'rxjs'
import { RootRouter } from '../router'
import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import { ContextMessage, HealthzResponse } from './interfaces'
import { AdminRouter } from './routers/admin.router'
import { take } from 'rxjs/operators'

export class PyYouwolClient extends RootRouter {
    public readonly admin: AdminRouter
    static ws: WebSocket
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
        this.admin = new AdminRouter(this, () => PyYouwolClient.webSocket$())
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

    static startWs$() {
        if (PyYouwolClient.ws) {
            PyYouwolClient.ws.close()
        }
        const path = window.location.host
        PyYouwolClient.ws$ = new Subject<ContextMessage>()
        PyYouwolClient.connectWs(`ws://${path}/ws`, PyYouwolClient.ws$)
        return PyYouwolClient.webSocket$().pipe(take(1))
    }

    static webSocket$() {
        return PyYouwolClient.ws$
    }

    static connectWs(path: string, channel$: Subject<ContextMessage>) {
        PyYouwolClient.ws = new WebSocket(path)
        PyYouwolClient.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                channel$.next(data)
            } catch (e) {
                console.error('Can not parse data', { error: String(e), event })
            }
        }
        PyYouwolClient.ws.onerror = (err) => {
            console.error(
                'Socket encountered error: ',
                String(err),
                'Closing socket',
            )
            console.log('error', err)
            PyYouwolClient.ws.close()
            console.log('Reconnect will be attempted in 1 second.')
            setTimeout(() => {
                this.connectWs(path, channel$)
            }, 1000)
        }

        return channel$
    }
}
