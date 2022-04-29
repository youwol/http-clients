import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import {
    CdnPackageResponse,
    CdnStatusResponse,
    CheckUpdateResponse,
    CheckUpdatesResponse,
    DownloadedPackageResponse,
    DownloadPackagesBody,
    GetCdnStatusResponse,
    PackageEvent,
    ResetCdnBody,
    ResetCdnResponse,
} from './interfaces'

class WebSocketAPI {
    constructor(public readonly ws$: () => WebSocketResponse$<unknown>) {}

    status$(
        filters: { packageName?: string; packageVersion?: string } = {},
    ): WebSocketResponse$<CdnStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<CdnStatusResponse>({
                withLabels: ['CdnStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    package$(
        filters: { packageId?: string } = {},
    ): WebSocketResponse$<CdnPackageResponse> {
        return this.ws$().pipe(
            filterCtxMessage<CdnPackageResponse>({
                withLabels: ['CdnPackageResponse'],
                withAttributes: filters,
            }),
        )
    }

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
    public readonly webSocket: WebSocketAPI

    constructor(parent: Router, ws$: () => WebSocketResponse$<unknown>) {
        super(parent.headers, `${parent.basePath}/local-cdn`)
        this.webSocket = new WebSocketAPI(ws$)
    }

    getStatus$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<GetCdnStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/status`,
            callerOptions,
        })
    }

    getPackage$({
        packageId,
        callerOptions,
    }: {
        packageId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetCdnStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/packages/${packageId}`,
            callerOptions,
        })
    }

    triggerCollectUpdates$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<CheckUpdatesResponse> {
        return this.send$({
            command: 'query',
            path: `/collect-updates`,
            callerOptions,
        })
    }

    download$({
        callerOptions,
        body,
    }: {
        body: DownloadPackagesBody
        callerOptions?: CallerRequestOptions
    }) {
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

    resetCdn$({
        callerOptions,
        body,
    }: {
        body?: ResetCdnBody
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<ResetCdnResponse> {
        return this.send$({
            command: 'delete',
            path: `/reset`,
            nativeRequestOptions: {
                method: 'POST',
                json: body || {},
            },
            callerOptions,
        })
    }
}
