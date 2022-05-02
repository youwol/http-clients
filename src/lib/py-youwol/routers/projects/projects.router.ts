import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import {
    GetProjectsLoadingResultsResponse,
    PipelineStepEvent,
    PipelineStepStatusResponse,
    ProjectsLoadingResults,
    GetProjectStatusResponse,
    ProjectStatus,
    Artifact,
    GetPipelineStatusResponse,
    PipelineStatus,
    GetArtifactsResponse,
} from './interfaces'
import { WsRouter } from '../../py-youwol.client'

class WebSocketAPI {
    constructor(public readonly ws: WsRouter) {}

    status$(): WebSocketResponse$<ProjectsLoadingResults> {
        return this.ws.data$.pipe(
            filterCtxMessage<ProjectsLoadingResults>({
                withLabels: ['ProjectsLoadingResults'],
            }),
        )
    }

    projectStatus$(
        filters: { projectId?: string } = {},
    ): WebSocketResponse$<ProjectStatus> {
        return this.ws.data$.pipe(
            filterCtxMessage<GetProjectStatusResponse>({
                withLabels: ['ProjectStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    pipelineStatus$(
        filters: { projectId?: string; flowId?: string } = {},
    ): WebSocketResponse$<PipelineStatus> {
        return this.ws.data$.pipe(
            filterCtxMessage<PipelineStatus>({
                withLabels: ['PipelineStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    stepStatus$(
        filters: { projectId?: string; flowId?: string; stepId?: string } = {},
    ): WebSocketResponse$<PipelineStepStatusResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<PipelineStepStatusResponse>({
                withLabels: ['PipelineStepStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    artifacts$(
        filters: { projectId?: string; flowId?: string } = {},
    ): WebSocketResponse$<Artifact> {
        return this.ws.data$.pipe(
            filterCtxMessage<Artifact>({
                withLabels: ['ArtifactsResponse'],
                withAttributes: filters,
            }),
        )
    }

    stepEvent$(
        filters: { packageName?: string; packageVersion?: string } = {},
    ): WebSocketResponse$<PipelineStepEvent> {
        return this.ws.data$.pipe(
            filterCtxMessage<PipelineStepEvent>({
                withLabels: ['PipelineStepEvent'],
                withAttributes: filters,
            }),
        )
    }
}

export class ProjectsRouter extends Router {
    public readonly webSocket: WebSocketAPI

    constructor(parent: Router, ws: WsRouter) {
        super(parent.headers, `${parent.basePath}/projects`)
        this.webSocket = new WebSocketAPI(ws)
    }

    /**
     * Status
     *
     * @param callerOptions
     */
    status$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<GetProjectsLoadingResultsResponse> {
        return this.send$({
            command: 'query',
            path: `/status`,
            callerOptions,
        })
    }

    getProjectStatus$({
        projectId,
        callerOptions,
    }: {
        projectId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetProjectStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}`,
            callerOptions,
        })
    }

    getArtifacts$({
        projectId,
        flowId,
        callerOptions,
    }: {
        projectId: string
        flowId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetArtifactsResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/flows/${flowId}/artifacts`,
            callerOptions,
        })
    }

    /**
     * Pipeline status
     *
     * @param projectId
     * @param flowId
     * @param callerOptions
     */
    getPipelineStatus$({
        projectId,
        flowId,
        callerOptions,
    }: {
        projectId: string
        flowId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPipelineStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/flows/${flowId}`,
            callerOptions,
        })
    }

    /**
     * Flow status
     *
     * @param projectId
     * @param flowId
     * @param stepId
     * @param callerOptions
     */
    getStepStatus$({
        projectId,
        flowId,
        stepId,
        callerOptions,
    }: {
        projectId: string
        flowId: string
        stepId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPipelineStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/flows/${flowId}/steps/${stepId}`,
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
    runStep$({
        projectId,
        flowId,
        stepId,
        callerOptions,
    }: {
        projectId: string
        flowId: string
        stepId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPipelineStatusResponse> {
        return this.send$({
            command: 'update',
            path: `/${projectId}/flows/${flowId}/steps/${stepId}/run`,
            callerOptions,
        })
    }
}
