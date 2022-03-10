export interface PackageVersionInfo {
    version: string
    fingerprint: string
}

export type UpdateStatus =
    | 'upToDate'
    | 'mismatch'
    | 'remoteAhead'
    | 'localAhead'

export interface CheckUpdateResponse {
    status: UpdateStatus
    packageName: string
    localVersionInfo: PackageVersionInfo
    remoteVersionInfo: PackageVersionInfo
}

export interface CheckUpdatesResponse {
    updates: CheckUpdateResponse[]
}

export interface DownloadPackageBody {
    packageName: string
    version: string
}

export interface DownloadPackagesBody {
    packages: DownloadPackageBody[]
    checkUpdateStatus: boolean
}

export interface DownloadedPackageResponse {
    packageName: string
    version: string
    fingerprint: string
}

export interface PackageDownloading {
    packageName: string
    version: string
}

export interface PackageEvent {
    packageName: string
    version: string
    event:
        | 'downloadStarted'
        | 'downloadDone'
        | 'updateCheckStarted'
        | 'updateCheckDone'
}
