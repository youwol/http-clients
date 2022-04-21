export interface UploadResponse {
    fileId: string
    fileName: string
    contentType: string
    contentEncoding: string
}

export interface Metadata {
    contentEncoding: string
    contentType: string
    fileName: string
}

export interface GetInfoResponse {
    metadata: Metadata
}
export interface UploadBody {
    fileName: string
    fileId?: string
    content: Blob | File
}
export interface RemoveResponse {}

export interface UpdateMetadataBody {
    contentEncoding?: string
    contentType?: string
    fileName?: string
}

export interface UpdateMetadataResponse {}
