export interface LoginResponse {
    id: string
    name: string
    email: string
    memberOf: string[]
}

export interface Command {
    name: string
}

export interface PathsBook {
    config: string
    system: string
    databases: string
    projects: string[]
    additionalPythonScrPaths: string[]
    usersInfo: string
    remotesInfo: string
    secrets?: string
    youwol: string
}

export interface DeadlinedCache {
    value: unknown
    deadline: number
    dependencies: { [key: string]: string }
}

export interface K8sNodeInfo {
    cpu: string
    memory: string
    architecture: string
    kernelVersion: string
    operating_system: string
    os_image: string
}

export interface K8sInstanceInfo {
    access_token: string
    nodes: K8sNodeInfo[]
    k8s_api_proxy: string
}

export interface DockerRepository {
    name: string
    pullSecret: string
}

export interface K8sDockerRepositories {
    repositories: DockerRepository[]
}

export interface K8sInstance {
    instanceInfo: K8sInstanceInfo
    configFile: string
    contextName: string
    docker: K8sDockerRepositories
    host: string
    proxyPort: string
}

export interface YouwolEnvironment {
    availableProfiles: string[]
    httpPort: number
    openidHost: string
    activeProfile?: string

    commands: { [key: string]: Command }

    userEmail?: string
    selectedRemote?: string

    pathsBook: PathsBook
    customDispatches: CustomDispatch[]
    cache: { [key: string]: unknown }

    tokensCache: DeadlinedCache[]

    k8sInstance?: K8sInstance
}

export interface UserInfo {
    id: string
    name: string
    email: string
    memberOf: string[]
}

export interface RemoteGatewayInfo {
    name: string
    host: string
    connected: boolean
}

export interface EnvironmentStatusResponse {
    configuration: YouwolEnvironment
    users: string[]
    userInfo: UserInfo
    remoteGateway?: RemoteGatewayInfo
    remotesInfo: RemoteGatewayInfo[]
}
export interface GetEnvironmentStatusResponse
    extends EnvironmentStatusResponse {}

export interface SwitchProfileResponse extends EnvironmentStatusResponse {}

export interface CustomDispatch {
    type: string
    name: string
    activated?: boolean
    parameters: { [k: string]: string }
}

export interface QueryCustomDispatchesResponse {
    dispatches: { [k: string]: CustomDispatch[] }
}

export type QueryCowSayResponse = string

export class UploadAssetResponse {}
