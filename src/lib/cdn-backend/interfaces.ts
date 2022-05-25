export interface Release {
    version: string
    version_number: number
    fingerprint: string
}

export interface GetHealthzResponse {
    status: 'cdn-backend ok'
}

export interface FolderResponse {
    name: string
    path: string
    size: number
}

export interface UploadBody {
    fileName: string
    blob: Blob
}

export interface FileResponse {
    name: string
    encoding: string
    size: number
}

export interface QueryExplorerResponse {
    size: number
    folders: FolderResponse[]
    files: FileResponse[]
}

export interface UploadResponse {
    name: string
    id: string
    version: string
    fingerprint: string
    compressedSize: number
    url: string
}

export interface GetVersionInfoResponse {
    name: string
    versions: string[]
    namespace: string
    id: string
    release: Release[]
}

export interface GetLibraryInfoResponse {
    name: string
    versions: string[]
    namespace: string
    id: string
    release: Release[]
}

export interface DeleteLibraryResponse {
    deletedVersionsCount: number
}
