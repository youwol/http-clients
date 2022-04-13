import { ReleaseResponse } from '../assets-gateway'

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

export interface PublishResponse {
    name: string
    id: string
    version: string
    fingerprint: string
    compressedSize: number
    url: string
}

export interface LibraryInfoResponse {
    name: string
    versions: string[]
    namespace: string
    id: string
    release: ReleaseResponse[]
}

export interface DeleteLibraryResponse {
    deletedVersionsCount: number
}
