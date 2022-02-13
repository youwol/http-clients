/** @format */

interface Failure {
    path: string
    failure: string
    message: string
}

export interface Target {
    family: 'application' | 'library' | 'service'
}

export interface Link {
    name: string
    url: string
}

export interface FileListing {
    include: string[]
    ignore: string[]
}

export interface Artifacts {
    id: string
    files: FileListing
    links: Link[]
}

export interface PipelineStep {
    id: string
    artifacts: Artifacts[]
}

export interface Flow {
    name: string
    dag: string[]
}

export interface Pipeline {
    target: Target
    tags: string[]
    description: string
    steps: PipelineStep[]
    flows: Flow[]
}

export interface Project {
    pipeline: Pipeline
    path: string
    name: string
    id: string
    version: string
}

export interface ProjectsLoadingResults {
    results: (Project | Failure)[]
}

export interface ChildToParentConnections {
    id: string
    parentIds: string[]
}

export interface DependenciesResponse {
    above: string[]
    below: string[]
    dag: ChildToParentConnections[]
    simpleDag: ChildToParentConnections[]
}

export interface ProjectStatusResponse {
    projectId: string
    projectName: string
    workspaceDependencies: DependenciesResponse[]
}

export interface ArtifactResponse {
    id: string
    path: string
    links: Link[]
}

export interface Manifest {
    succeeded: boolean
    fingerprint: string
    creationDate: string
    files: string[]
    cmdOutputs: string[] | { [key: string]: unknown }
}

export interface PipelineStepStatus {
    id: string
    path: string
    links: Link[]
}

export interface PipelineStepStatusResponse {
    projectId: string
    flowId: string
    stepId: string
    artifactFolder: string
    artifacts: ArtifactResponse[]
    manifest?: Manifest
    status: 'OK' | 'KO' | 'outdated' | 'none'
}

export interface PipelineStatusResponse {
    projectId: string
    steps: PipelineStepStatusResponse[]
}

export interface ArtifactsResponse {
    artifacts: ArtifactResponse[]
}

export interface PipelineStepEvent {
    projectId: string
    flowId: string
    stepId: string
    event: 'runStarted' | 'runDone' | 'statusCheckStarted' | 'statusCheckDone'
}
