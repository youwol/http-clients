/** @format */

export interface HealthzResponse {
    status: 'py-youwol ok'
}

export type Label =
    | 'Label.DONE'
    | 'Label.INFO'
    | 'Label.STARTED'
    | 'Label.BASH'
    | 'Label.LOG_ABORT'
    | 'Label.EXCEPTION'
    | 'Label.FAILED'
    | 'EnvironmentStatusResponse'
    | 'PipelineStatusResponse'
    | 'PipelineStepStatusResponse'
    | 'ProjectStatusResponse'
    | 'CdnResponse'
    | 'CheckUpdateResponse'
    | 'CheckUpdatesResponse'
    | 'Label.PACKAGE_DOWNLOADING'
    | 'DownloadedPackageResponse'
    | 'ProjectsLoadingResults'
    | 'Label.PIPELINE_STEP_STATUS_PENDING'
    | 'Label.PIPELINE_STEP_RUNNING'
    | 'Label.RUN_PIPELINE_STEP'
    | 'HelmPackage'

export interface ContextMessage<T = unknown> {
    contextId: string
    level: string
    text: string
    labels: Label[]
    parentContextId: string | undefined
    data: T
    attributes: { [key: string]: string }
}
