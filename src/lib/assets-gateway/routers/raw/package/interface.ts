export interface ReleaseResponse {
    version: string
    version_number: number
    fingerprint: string
}

export interface MetadataResponse {
    name: string
    version: string[]
    namespace: string
    id: string
    release: ReleaseResponse[]
}
