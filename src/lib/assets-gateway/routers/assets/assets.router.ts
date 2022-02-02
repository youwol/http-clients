/** @format */

import { Observable } from 'rxjs'
import { Router } from '../../../router'
import {
    CallerRequestOptions,
    HTTPError,
    HTTPResponse$,
    uploadBlob,
} from '../../../utils'

import {
    AccessInfo,
    AccessPolicyBody,
    Asset,
    ExposingGroup,
    UpdateAssetBody,
} from './interfaces'
import {
    AssetDataRouter,
    AssetFluxProjectRouter,
    AssetPackageRouter,
    AssetStoryRouter,
} from '.'

export class AssetsRouter extends Router {
    public readonly fluxProject: AssetFluxProjectRouter
    public readonly story: AssetStoryRouter
    public readonly data: AssetDataRouter
    public readonly package: AssetPackageRouter

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/assets`)
        this.fluxProject = new AssetFluxProjectRouter(this)
        this.story = new AssetStoryRouter(this)
        this.data = new AssetDataRouter(this)
        this.package = new AssetPackageRouter(this)
    }

    /**
     * Retrieve an asset.
     *
     * @param assetId
     * @param callerOptions
     */
    get$(
        assetId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset> {
        return this.send$({
            command: 'query',
            path: `/${assetId}`,
            callerOptions,
        })
    }

    /**
     * Get access information.
     *
     * @param assetId
     * @param callerOptions
     */
    getAccess$(
        assetId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<AccessInfo> {
        return this.send$({
            command: 'query',
            path: `/${assetId}/access`,
            callerOptions,
        })
    }

    /**
     * Update access settings w/ a particular group.
     *
     * @param assetId
     * @param groupId The group id for which the settings are applied
     * @param body
     * @param callerOptions
     */
    updateAccess$(
        assetId: string,
        groupId: string,
        body: AccessPolicyBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<ExposingGroup> {
        return this.send$({
            command: 'update',
            path: `/${assetId}/access/${groupId}`,
            nativeRequestOptions: { method: 'PUT', json: body },
            callerOptions,
        })
    }

    /**
     * Update metadata of an asset.
     *
     * @param assetId
     * @param body
     * @param callerOptions
     */
    update$(
        assetId: string,
        body: UpdateAssetBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset> {
        return this.send$({
            command: 'update',
            path: `/${assetId}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }

    /**
     * Add a picture.
     *
     * @param assetId
     * @param pictureId id of the picture
     * @param blob Blob content of the picture
     * @param callerOptions
     */
    addPicture$(
        assetId: string,
        pictureId: string,
        blob: Blob,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset> {
        return uploadBlob(
            `${this.basePath}/${assetId}/images/${pictureId}`,
            pictureId,
            'POST',
            blob,
            {},
            callerOptions,
        ) as Observable<Asset | HTTPError>
    }

    /**
     * Remove a picture.
     *
     * @param assetId
     * @param pictureId name of the picture (act as id)
     * @param callerOptions
     */
    removePicture$(
        assetId: string,
        pictureId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset> {
        return this.send$({
            command: 'delete',
            path: `/${assetId}/images/${pictureId}`,
            callerOptions,
        })
    }
}
