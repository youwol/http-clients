/** @format */

import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { ContextMessage$, filterCtxMessage } from '../../../ws-utils'
import {
    PipelineStatusResponse,
    PipelineStepStatusResponse,
    ProjectsLoadingResults,
} from './interfaces'

class WebSocketAPI {
    constructor(public readonly ws$: () => ContextMessage$<unknown>) {}

    status$(): ContextMessage$<ProjectsLoadingResults> {
        return this.ws$().pipe(
            filterCtxMessage<ProjectsLoadingResults>({
                withLabels: ['ProjectsLoadingResults'],
            }),
        )
    }

    projectStatus$(
        filters: { projectId?: string } = {},
    ): ContextMessage$<ProjectStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<ProjectStatusResponse>({
                withLabels: ['ProjectStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    pipelineStatus$(
        filters: { projectId?: string; flowId?: string } = {},
    ): ContextMessage$<PipelineStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<PipelineStatusResponse>({
                withLabels: ['PipelineStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    stepStatus$(
        filters: { projectId?: string; flowId?: string; stepId?: string } = {},
    ): ContextMessage$<PipelineStepStatusResponse> {
        return this.ws$().pipe(
            filterCtxMessage<PipelineStepStatusResponse>({
                withLabels: ['PipelineStepStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    artifacts$(
        filters: { projectId?: string; flowId?: string } = {},
    ): ContextMessage$<ArtifactsResponse> {
        return this.ws$().pipe(
            filterCtxMessage<PipelineStepStatusResponse>({
                withLabels: ['ArtifactsResponse'],
                withAttributes: filters,
            }),
        )
    }
}

export class ProjectsRouter extends Router {
    webSocket: WebSocketAPI

    constructor(parent: Router, ws$: () => ContextMessage$<unknown>) {
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
