export interface PostFileResponse {
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

export interface StatsResponse {
    metadata: Metadata
}

export interface RemoveResponse {}

export interface PostMetadataBody {
    contentEncoding?: string
    contentType?: string
    fileName?: string
}

export interface PostMetadataResponse {}
