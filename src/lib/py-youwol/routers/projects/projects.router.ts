/** @format */

import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import {
    ArtifactsResponse,
    PipelineStatusResponse,
    PipelineStepEvent,
    PipelineStepStatusResponse,
    ProjectsLoadingResults,
    ProjectStatusResponse,
} from './interfaces'

class WebSocketAPI {
    constructor(public readonly ws$: () => WebSocketResponse$<unknown>) {}

    status$(): WebSocketResponse$<ProjectsLoadingResults> {
        return this.ws$().pipe(
            filterCtxMessage<ProjectsLoadingResults>({
                withLabels: ['ProjectsLoadingResults'],
            }),
        )
    }

    projectStatus$(
        filters: { projectId?: string } = {},
    ): WebSocketResponse$<ProjectStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<ProjectStatusResponse>({
                withLabels: ['ProjectStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    pipelineStatus$(
        filters: { projectId?: string; flowId?: string } = {},
    ): WebSocketResponse$<PipelineStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<PipelineStatusResponse>({
                withLabels: ['PipelineStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    stepStatus$(
        filters: { projectId?: string; flowId?: string; stepId?: string } = {},
    ): WebSocketResponse$<PipelineStepStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<PipelineStepStatusResponse>({
                withLabels: ['PipelineStepStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    artifacts$(
        filters: { projectId?: string; flowId?: string } = {},
    ): WebSocketResponse$<ArtifactsResponse> {
        return this.ws$().pipe(
            filterCtxMessage<PipelineStepStatusResponse>({
                withLabels: ['ArtifactsResponse'],
                withAttributes: filters,
            }),
        )
    }

    stepEvent$(
        filters: { packageName?: string; packageVersion?: string } = {},
    ): WebSocketResponse$<PipelineStepEvent> {
        return this.ws$().pipe(
            filterCtxMessage<PipelineStepEvent>({
                withLabels: ['PipelineStepEvent'],
                withAttributes: filters,
            }),
        )
    }
}

export class ProjectsRouter extends Router {
    webSocket: WebSocketAPI

    constructor(parent: Router, ws$: () => WebSocketResponse$<unknown>) {
        super(parent.headers, `${parent.basePath}/projects`)
        this.webSocket = new WebSocketAPI(ws$)
    }

    /**
     * Status
     *
     * @param callerOptions
     */
    status$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<ProjectsLoadingResults> {
        return this.send$({
            command: 'query',
            path: `/status`,
            callerOptions,
        })
    }

    getProjectStatus$(
        projectId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<ProjectStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}`,
            callerOptions,
        })
    }

    getArtifacts$(
        projectId: string,
        flowId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<ArtifactsResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/flows/${flowId}/artifacts`,
            callerOptions,
        })
    }

    /**
     * Flow status
     *
     * @param projectId
     * @param flowId
     * @param callerOptions
     */
    flowStatus$(
        projectId: string,
        flowId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<PipelineStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/flows/${flowId}`,
            callerOptions,
        })
    }

    /**
     * Run a step
     *
     * @param projectId
     * @param flowId
     * @param stepId
     * @param callerOptions
     */
    runStep$(
        projectId: string,
        flowId: string,
        stepId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<PipelineStatusResponse> {
        return this.send$({
            command: 'update',
            path: `/${projectId}/flows/${flowId}/steps/${stepId}/run`,
            callerOptions,
        })
    }
}
