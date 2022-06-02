import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import {
    AddImageResponse,
    CreateAssetResponse,
    DeleteAccessPolicyResponse,
    DeleteAssetResponse,
    GetAccessPolicyResponse,
    GetAssetResponse,
    GetHealthzResponse,
    GetPermissionsResponse,
    UpdateAssetResponse,
    UpdateAssetBody,
    UpsertAccessPolicyBody,
    UpsertAccessPolicyResponse,
    CreateAssetBody,
    RemoveImageResponse,
    AddImageBody,
    QueryAccessInfoResponse,
} from './interfaces'
import { RootRouter } from '../router'

export class AssetsClient extends RootRouter {
    constructor({
        headers,
        basePath,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
    } = {}) {
        super({
            basePath: basePath || '/api/assets-backend',
            headers,
        })
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<GetHealthzResponse> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }

    /**
     * Create an asset
     *
     * @param groupId
     * @param body
     * @param callerOptions
     */
    createAsset$({
        body,
        callerOptions,
    }: {
        body: CreateAssetBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<CreateAssetResponse> {
        return this.send$({
            command: 'create',
            path: `/assets`,
            nativeRequestOptions: {
                json: body,
                method: 'PUT',
            },
            callerOptions,
        })
    }

    /**
     * Update asset
     *
     * @param groupId
     * @param body
     * @param callerOptions
     */
    updateAsset$({
        assetId,
        body,
        callerOptions,
    }: {
        assetId: string
        body: UpdateAssetBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpdateAssetResponse> {
        return this.send$({
            command: 'update',
            path: `/assets/${assetId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Delete asset
     *
     * @param assetId
     * @param callerOptions
     */
    deleteAsset$({
        assetId,
        callerOptions,
    }: {
        assetId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteAssetResponse> {
        return this.send$({
            command: 'delete',
            path: `/assets/${assetId}`,
            callerOptions,
        })
    }

    /**
     * Get asset
     *
     * @param assetId
     * @param callerOptions
     */
    getAsset$({
        assetId,
        callerOptions,
    }: {
        assetId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetAssetResponse> {
        return this.send$({
            command: 'query',
            path: `/assets/${assetId}`,
            callerOptions,
        })
    }

    /**
     * Upsert access policy for a particular group.
     *
     * @param driveId
     * @param body
     * @param callerOptions
     */
    upsertAccessPolicy$({
        assetId,
        groupId,
        body,
        callerOptions,
    }: {
        assetId: string
        groupId: string
        body: UpsertAccessPolicyBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<UpsertAccessPolicyResponse> {
        return this.send$({
            command: 'create',
            path: `/assets/${assetId}/access/${groupId}`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Delete the access policy for a particular group.
     *
     * @param assetId
     * @param groupId
     * @param callerOptions
     */
    deleteAccessPolicy$({
        assetId,
        groupId,
        callerOptions,
    }: {
        assetId: string
        groupId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteAccessPolicyResponse> {
        return this.send$({
            command: 'delete',
            path: `/assets/${assetId}/access/${groupId}`,
            callerOptions,
        })
    }

    /**
     * Retrieve access policy of a group
     *
     * @param assetId
     * @param groupId
     * @param callerOptions
     */
    getAccessPolicy$({
        assetId,
        groupId,
        callerOptions,
    }: {
        assetId: string
        groupId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetAccessPolicyResponse> {
        return this.send$({
            command: 'query',
            path: `/assets/${assetId}/access/${groupId}`,
            callerOptions,
        })
    }

    /**
     * Retrieve permissions of the current user on an asset
     *
     * @param assetId
     * @param callerOptions
     */
    getPermissions$({
        assetId,
        callerOptions,
    }: {
        assetId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPermissionsResponse> {
        return this.send$({
            command: 'query',
            path: `/assets/${assetId}/permissions`,
            callerOptions,
        })
    }

    /**
     * Gather permissions related to the asset
     *
     * @param assetId
     * @param callerOptions
     */
    queryAccessInfo$({
        assetId,
        callerOptions,
    }: {
        assetId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<QueryAccessInfoResponse> {
        return this.send$({
            command: 'query',
            path: `/assets/${assetId}/access-info`,
            callerOptions,
        })
    }

    /**
     * Add an image
     *
     * @param assetId
     * @param filename
     * @param body
     * @param content
     * @param callerOptions
     */
    addImage$({
        assetId,
        filename,
        body,
        callerOptions,
    }: {
        assetId: string
        filename: string
        body: AddImageBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<AddImageResponse> {
        const file =
            body.content instanceof Blob
                ? new File([body.content], filename, {
                      type: body.content.type,
                  })
                : body.content

        const formData = new FormData()
        formData.append('file', file)

        return this.sendFormData$({
            command: 'upload',
            path: `/assets/${assetId}/images/${filename}`,
            formData: formData,
            callerOptions,
        }) as HTTPResponse$<AddImageResponse>
    }

    /**
     * Remove an image
     *
     * @param assetId
     * @param imageId
     * @param callerOptions
     */
    removeImage$({
        assetId,
        filename,
        callerOptions,
    }: {
        assetId: string
        filename: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<RemoveImageResponse> {
        return this.send$({
            command: 'delete',
            path: `/assets/${assetId}/images/${filename}`,
            callerOptions,
        })
    }

    /**
     * Get a media (image, thumbnail)
     *
     * @param assetId
     * @param mediaType
     * @param filename
     * @param callerOptions
     */
    getMedia$({
        assetId,
        mediaType,
        filename,
        callerOptions,
    }: {
        assetId: string
        mediaType: 'images' | 'thumbnails'
        filename: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
        return this.send$({
            command: 'query',
            path: `/assets/${assetId}/${mediaType}/${filename}`,
            callerOptions,
        })
    }
}
