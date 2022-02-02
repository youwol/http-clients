/** @format */

import { Observable } from 'rxjs'
import { Router } from '../../../router'
import { CallerRequestOptions, HTTPError, uploadBlob } from '../../../utils'
import { FluxProjectRouter } from './flux-project/flux-project.router'
import {
    AccessInfo,
    AccessPolicyBody,
    Asset,
    ExposingGroup,
    UpdateAssetBody,
} from './interfaces'
import { StoryRouter } from './story/story.router'
import { DataRouter } from './data/data.router'
import { PackageRouter } from './package/package.router'

export class AssetsRouter extends Router {
    public readonly fluxProject: FluxProjectRouter
    public readonly story: StoryRouter
    public readonly data: DataRouter
    public readonly package: PackageRouter

    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/assets`)
        this.fluxProject = new FluxProjectRouter(this)
        this.story = new StoryRouter(this)
        this.data = new DataRouter(this)
        this.package = new PackageRouter(this)
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
    ): Observable<Asset | HTTPError> {
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
    ): Observable<AccessInfo | HTTPError> {
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
    ): Observable<ExposingGroup | HTTPError> {
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
    ): Observable<Asset | HTTPError> {
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
    ): Observable<Asset | HTTPError> {
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
    ): Observable<Asset | HTTPError> {
        return this.send$({
            command: 'delete',
            path: `/${assetId}/images/${pictureId}`,
            callerOptions,
        })
    }
}
