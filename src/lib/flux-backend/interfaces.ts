export interface NewProjectBody {
    name: string
    projectId?: string
}

export interface NewProjectResponse {
    projectId: string
    libraries: { [k: string]: string }
}

export type UploadResponse = NewProjectResponse
export interface UploadBody {
    content: Blob | File
}
export interface DeleteProjectResponse {
    status: 'deleted'
    projectId: string
}

export interface Library {
    name: string
    version: string
    id: string
    apiKey: string
    exportedSymbol: string
}

export interface LoadingGraph {
    graphType: string
    lock?: Library[]
    definition: [string, string][][]
}

export interface Requirements {
    fluxComponents: string[]
    fluxPacks: string[]
    libraries: { [k: string]: string }
    loadingGraph: LoadingGraph
}

export interface FactoryId {
    module: string
    pack: string
}

export interface Plugin {
    configuration: unknown
    moduleId: string
    parentModuleId: string
    factoryId: FactoryId
}

export interface Module {
    configuration: unknown
    moduleId: string
    factoryId: FactoryId
}

export interface Slot {
    slotId: string
    moduleId: string
}

export interface Adaptor {
    mappingFunction: string
    adaptorId: string
}

export interface Connection {
    start: Slot
    end: Slot
    adaptor?: Adaptor
}

export interface Workflow {
    modules: Module[]
    connections: Connection[]
    plugins: Plugin[]
}

export interface ModuleView {
    moduleId: string
    xWorld: number
    yWorld: number
}

export interface ConnectionView {
    wireless: boolean
    connectionId: string
}

export interface Rendering {
    layout: string
    style: string
}

export interface RunnerRendering {
    layout: string
    style: string
}

export interface BuilderRendering {
    modulesView: ModuleView[]
    connectionsView: ConnectionView[]
}

export interface Project {
    name: string
    schemaVersion: string
    description: string
    requirements: Requirements
    workflow: Workflow
    builderRendering: BuilderRendering
    runnerRendering: RunnerRendering
}

export type GetProjectResponse = Project

export type UpdateProjectBody = Project

export type UpdateProjectResponse = Record<string, never>

export interface UpdateMetadataBody {
    name?: string
    description?: string
    libraries?: { [k: string]: string }
}

export type UpdateMetadataResponse = Record<string, never>
export type DuplicateResponse = NewProjectResponse

export interface OpenWithDescription {
    match: { [k: string]: string } | string
    parametrized: { [k: string]: string } | string
}

export interface GraphicsDescription {
    appIcon: { [k: string]: unknown }
    fileIcon: { [k: string]: unknown }
    background: { [k: string]: unknown }
}

export interface ExecutionDescription {
    standalone: boolean
    parametrized: OpenWithDescription[]
}

export interface PublishApplicationBody {
    name: string
    displayName: string
    version: string
    execution: ExecutionDescription
    graphics: GraphicsDescription
}
