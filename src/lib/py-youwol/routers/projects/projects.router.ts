import { Router } from '../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { filterCtxMessage, WebSocketResponse$ } from '../../../ws-utils'
import {
    GetProjectsStatusResponse,
    PipelineStepEvent,
    PipelineStepStatusResponse,
    GetProjectStatusResponse,
    GetPipelineStatusResponse,
    GetArtifactsResponse,
    ArtifactsResponse,
    ProjectStatusResponse,
    PipelineStatusResponse,
    ProjectsLoadingResultsResponse,
    GetPipelineStepStatusResponse,
    RunStepResponse,
    PipelineStepEventKind,
    CreateProjectFromTemplateBody,
    CreateProjectFromTemplateResponse,
} from './interfaces'
import { WsRouter } from '../../py-youwol.client'

class WebSocketAPI {
    constructor(public readonly ws: WsRouter) {}

    status$(): WebSocketResponse$<ProjectsLoadingResultsResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<ProjectsLoadingResultsResponse>({
                withLabels: ['ProjectsLoadingResults'],
            }),
        )
    }

    projectStatus$(
        filters: { projectId?: string } = {},
    ): WebSocketResponse$<ProjectStatusResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<ProjectStatusResponse>({
                withLabels: ['ProjectStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    pipelineStatus$(
        filters: { projectId?: string; flowId?: string } = {},
    ): WebSocketResponse$<PipelineStatusResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<PipelineStatusResponse>({
                withLabels: ['PipelineStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    pipelineStepStatus$(
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
    ): WebSocketResponse$<ArtifactsResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<ArtifactsResponse>({
                withLabels: ['ArtifactsResponse'],
                withAttributes: filters,
            }),
        )
    }

    stepEvent$(
        filters: {
            projectId?: string
            flowId?: string
            stepId?: string
            event?: PipelineStepEventKind
        } = {},
    ): WebSocketResponse$<PipelineStepEvent> {
        return this.ws.data$.pipe(
            filterCtxMessage<PipelineStepEvent>({
                withLabels: ['PipelineStepEvent'],
                withDataAttributes: filters,
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
    } = {}): HTTPResponse$<GetProjectsStatusResponse> {
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
    getPipelineStepStatus$({
        projectId,
        flowId,
        stepId,
        callerOptions,
    }: {
        projectId: string
        flowId: string
        stepId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPipelineStepStatusResponse> {
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
    }): HTTPResponse$<RunStepResponse> {
        return this.send$({
            command: 'update',
            path: `/${projectId}/flows/${flowId}/steps/${stepId}/run`,
            callerOptions,
        })
    }

    /**
     * Create a new project from a template
     *
     * @param body
     * @param callerOptions
     */
    createProjectFromTemplate({
        body,
        callerOptions,
    }: {
        body: CreateProjectFromTemplateBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<CreateProjectFromTemplateResponse> {
        return this.send$({
            command: 'create',
            path: `/create-from-template`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }
}
