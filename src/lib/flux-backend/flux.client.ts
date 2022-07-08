import {
    CallerRequestOptions,
    downloadBlob,
    HTTPError,
    HTTPResponse$,
} from '../utils'
import {
    NewProjectBody,
    NewProjectResponse,
    DeleteProjectResponse,
    GetProjectResponse,
    UpdateProjectBody,
    UpdateProjectResponse,
    UpdateMetadataBody,
    UpdateMetadataResponse,
    UploadResponse,
    UploadBody,
    DuplicateResponse,
    PublishApplicationBody,
} from './interfaces'
import { UploadResponse as CdnUploadResponse } from '../cdn-backend'
import { RootRouter } from '../router'
import { Observable } from 'rxjs'
import { NewAssetResponse } from '../assets-gateway'

export class FluxClient extends RootRouter {
    constructor({
        headers,
        basePath,
        hostName,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
        hostName?: string
    } = {}) {
        super({
            basePath: basePath || '/api/flux-backend',
            headers,
            hostName,
        })
    }

    /**
     * Create an empty project
     *
     * @param body new project's body
     * @param queryParameters
     * @param queryParameters.folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return file response or asset depending on whether the client is used through assets-gtw
     */
    newProject$({
        body,
        queryParameters,
        callerOptions,
    }: {
        body: NewProjectBody
        queryParameters: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<
        NewAssetResponse<NewProjectResponse> | NewProjectResponse
    > {
        const suffix = queryParameters.folderId
            ? `?folder-id=${queryParameters.folderId}`
            : ''
        return this.send$({
            command: 'create',
            path: `/projects/create${suffix}`,
            callerOptions,
            nativeRequestOptions: {
                method: 'POST',
                json: { ...body, description: '' },
            },
        })
    }

    /**
     * Publish a story from a .zip file containing a list of flux-projects
     * to import.
     *
     * For each flux-project:
     * *  the folder name is the project's id
     * *  the folder should contain the required files:
     *      *  description.json
     *      *  workflow.json
     *      *  builderRendering.json
     *      *  runnerRendering.json
     *      *  requirements.json
     *
     * @param body
     * @param body.content binary content of the zip file
     * @param queryParameters
     * @param queryParameters.projectId if provided, id of the project created
     * @param queryParameters.folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return file response or asset depending on whether the client is used through assets-gtw
     */
    upload$({
        body,
        queryParameters,
        callerOptions,
    }: {
        body: UploadBody
        queryParameters: {
            projectId?: string
            folderId?: string
        }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<NewAssetResponse<UploadResponse> | UploadResponse> {
        const content = body.content
        const file =
            content instanceof Blob
                ? new File([content], 'flux-project.zip', {
                      type: content.type,
                  })
                : content

        const formData = new FormData()
        formData.append('file', file)

        return this.sendFormData$({
            command: 'upload',
            path: `/projects/upload`,
            queryParameters,
            formData: formData,
            callerOptions,
        }) as Observable<
            NewAssetResponse<UploadResponse> | UploadResponse | HTTPError
        >
    }

    /**
     * Delete a project.
     *
     * @param projectId
     * @param callerOptions
     */
    deleteProject$({
        projectId,
        callerOptions,
    }: {
        projectId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteProjectResponse> {
        return this.send$({
            command: 'delete',
            path: `/projects/${projectId}`,
            callerOptions,
        })
    }

    /**
     * Get a specific project.
     *
     * @param projectId
     * @param callerOptions
     */
    getProject$({
        projectId,
        callerOptions,
    }: {
        projectId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetProjectResponse> {
        return this.send$({
            command: 'query',
            path: `/projects/${projectId}`,
            callerOptions,
        })
    }

    /**
     * Update a project
     *
     * @param projectId
     * @param body
     * @param callerOptions
     */
    updateProject$({
        projectId,
        body,
        callerOptions,
    }: {
        projectId: string
        body: UpdateProjectBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpdateProjectResponse> {
        return this.send$({
            command: 'update',
            path: `/projects/${projectId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }
    /**
     * download a zip of the project
     *
     * @param projectId
     * @param callerOptions
     */
    downloadZip$({
        projectId,
        callerOptions,
    }: {
        projectId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/projects/${projectId}/download-zip`,
            projectId,
            {},
            callerOptions,
        )
    }

    /**
     * update metadata of a project
     *
     * @param projectId
     * @param body
     * @param callerOptions
     */
    updateMetadata$({
        projectId,
        body,
        callerOptions,
    }: {
        projectId: string
        body: UpdateMetadataBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpdateMetadataResponse> {
        return this.send$({
            command: 'update',
            path: `/projects/${projectId}/metadata`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * duplicate a project
     *
     * @param projectId
     * @param queryParameters
     * @param queryParameters.folderId define the parent item in explorer (required if used through AssetsGatewayClient)
     * @param callerOptions
     */
    duplicate$({
        projectId,
        queryParameters,
        callerOptions,
    }: {
        projectId: string
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<NewAssetResponse<DuplicateResponse> | DuplicateResponse> {
        const suffix =
            queryParameters && queryParameters.folderId
                ? `?folder-id=${queryParameters.folderId}`
                : ''

        return this.send$({
            command: 'update',
            path: `/projects/${projectId}/duplicate${suffix}`,
            callerOptions,
        })
    }

    /**
     * duplicate a project
     *
     * @param projectId
     * @param body
     * @param queryParameters
     * @param queryParameters.folderId define the parent item in explorer (required if used through AssetsGatewayClient)
     * in which the package is exposed. Relevant only if the asset does not already exist.
     * @param callerOptions
     */
    publishApplication$({
        projectId,
        body,
        queryParameters,
        callerOptions,
    }: {
        projectId: string
        body: PublishApplicationBody
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<NewAssetResponse<CdnUploadResponse> | CdnUploadResponse> {
        const suffix =
            queryParameters && queryParameters.folderId
                ? `?folder-id=${queryParameters.folderId}`
                : ''

        return this.send$({
            command: 'update',
            path: `/projects/${projectId}/publish-application${suffix}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }
}
