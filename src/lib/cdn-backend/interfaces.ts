export interface HealthzResponse {
    status: 'cdn-backend ok'
}

export interface FolderResponse {
    name: string
    path: string
    size: number
}

export interface FileResponse {
    name: string
    encoding: string
    size: number
}

export interface ExplorerResponse {
    size: number
    folders: FolderResponse[]
    files: FileResponse[]
}
