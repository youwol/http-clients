import { Asset } from '../../..'
import { Router } from '../../../../router'
import {
    CallerRequestOptions,
    HTTPError,
    HTTPResponse$,
    uploadBlob,
} from '../../../../utils'
import { FolderId } from '../../explorer'
import { Observable } from 'rxjs'

export class AssetStoryRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/story`)
    }

    /**
     * Create an empty story.
     *
     * @param folderId Location of the created story
     * @param body
     * @param body.storyId id of the story
     * @param body.title title of the story
     * @param callerOptions
     */
    create$(
        folderId: FolderId,
        body: { storyId?: string; title: string },
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset> {
        return this.send$({
            command: 'create',
            path: `/location/${folderId}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }

    /**
     * Publish a story from a .zip file
     *
     * @param folderId destination folder id
     * @param fileName string
     * @param blob Blob content of the zip file
     * @param callerOptions
     */
    publish$(
        folderId: FolderId,
        fileName: string,
        blob: Blob,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset> {
        return uploadBlob(
            `${this.basePath}/location/${folderId}/publish`,
            fileName,
            'PUT',
            blob,
            {},
            callerOptions,
        ) as Observable<Asset | HTTPError>
    }
}
