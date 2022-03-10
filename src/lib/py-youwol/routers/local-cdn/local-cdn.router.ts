import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import {
    CheckUpdateResponse,
    CheckUpdatesResponse,
    DownloadedPackageResponse,
    DownloadPackagesBody,
    PackageEvent,
} from './interfaces'

class WebSocketAPI {
    constructor(public readonly ws$: () => WebSocketResponse$<unknown>) {}

    updateStatus$(
        filters: { packageName?: string; packageVersion?: string } = {},
    ): WebSocketResponse$<CheckUpdateResponse> {
        return this.ws$().pipe(
            filterCtxMessage<CheckUpdateResponse>({
                withLabels: ['CheckUpdateResponse'],
                withAttributes: filters,
            }),
        )
    }

    updatesStatus$(): WebSocketResponse$<CheckUpdatesResponse> {
        return this.ws$().pipe(
            filterCtxMessage<CheckUpdatesResponse>({
                withLabels: ['CheckUpdatesResponse'],
            }),
        )
    }

    downloadedPackage$(
        filters: { packageName?: string; packageVersion?: string } = {},
    ): WebSocketResponse$<DownloadedPackageResponse> {
        return this.ws$().pipe(
            filterCtxMessage<DownloadedPackageResponse>({
                withLabels: ['DownloadedPackageResponse'],
                withAttributes: filters,
            }),
        )
    }

    packageEvent$(
        filters: { packageName?: string; packageVersion?: string } = {},
    ): WebSocketResponse$<PackageEvent> {
        return this.ws$().pipe(
            filterCtxMessage<PackageEvent>({
                withLabels: ['PackageEvent'],
                withAttributes: filters,
            }),
        )
    }
}

export class LocalCdnRouter extends Router {
    webSocket: WebSocketAPI

    constructor(parent: Router, ws$: () => WebSocketResponse$<unknown>) {
        super(parent.headers, `${parent.basePath}/local-cdn`)
        this.webSocket = new WebSocketAPI(ws$)
    }

    triggerCollectUpdates$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<CheckUpdatesResponse> {
        return this.send$({
            command: 'query',
            path: `/collect-updates`,
            callerOptions,
        })
    }

    download$(
        body: DownloadPackagesBody,
        callerOptions: CallerRequestOptions = {},
    ) {
        return this.send$({
            command: 'update',
            path: `/download`,
            nativeRequestOptions: {
                method: 'POST',
                json: body,
            },
            callerOptions,
        })
    }
}
