/** @format */

import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { ContextMessage } from '../../interfaces'

export interface LogResponse<T = unknown> extends ContextMessage<T> {
    failed?: boolean
}

export interface LogsResponse {
    logs: LogResponse[]
}

export class SystemRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/system`)
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
}
