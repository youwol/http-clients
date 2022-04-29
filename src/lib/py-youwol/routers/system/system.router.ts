import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { ContextMessage } from '../../interfaces'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import { filter } from 'rxjs/operators'

export type Kind = 'package' | 'data' | 'flux-project' | 'story'
export type DownloadEventType = 'enqueued' | 'started' | 'succeeded' | 'failed'

export interface LogResponse<T = unknown> extends ContextMessage<T> {
    failed?: boolean
}

export interface LogsResponse {
    logs: LogResponse[]
}

export interface DownloadEvent {
    kind: string
    rawId: string
    type: DownloadEventType
}

export interface ClearLogsResponse {}

class WebSocketAPI {
    constructor(public readonly ws$: () => WebSocketResponse$<unknown>) {}

    downloadEvent$(
        filters: { rawId?: string; kind?: Kind; type?: DownloadEventType } = {},
    ): WebSocketResponse$<DownloadEvent> {
        return this.ws$().pipe(
            filterCtxMessage<DownloadEvent>({
                withLabels: ['DownloadEvent'],
                withAttributes: filters,
            }),
            filter((message: ContextMessage<DownloadEvent>) => {
                return Object.entries(filters)
                    .map(([k, v]) => {
                        return message.data[k] == v
                    })
                    .reduce((acc, e) => acc && e, true)
            }),
        )
    }
}

export class SystemRouter extends Router {
    public readonly webSocket: WebSocketAPI

    constructor(parent: Router, ws$: () => WebSocketResponse$<unknown>) {
        super(parent.headers, `${parent.basePath}/system`)
        this.webSocket = new WebSocketAPI(ws$)
    }

    queryFolderContent$(
        path: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<{
        configurations: string[]
        folders: string[]
        files: string[]
    }> {
        return this.send$({
            command: 'query',
            path: `/folder-content`,
            nativeRequestOptions: {
                method: 'POST',
                json: { path },
            },
            callerOptions,
        })
    }

    getFileContent$(
        path: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<string> {
        return this.send$({
            command: 'query',
            path: `/file/${path}`,
            callerOptions,
        })
    }

    queryRootLogs$(
        {
            fromTimestamp,
            maxCount,
        }: {
            fromTimestamp: number
            maxCount: number
        },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<LogsResponse> {
        return this.send$({
            command: 'query',
            path: `/logs/?from-timestamp=${fromTimestamp}&max-count=${maxCount}`,
            callerOptions,
        })
    }

    queryLogs$(
        parentId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<LogsResponse> {
        return this.send$({
            command: 'query',
            path: `/logs/${parentId}`,
            callerOptions,
        })
    }

    clearLogs$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<ClearLogsResponse> {
        return this.send$({
            command: 'delete',
            path: `/logs`,
            callerOptions,
        })
    }
}
