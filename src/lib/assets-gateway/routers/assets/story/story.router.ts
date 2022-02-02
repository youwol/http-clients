/** @format */

import { Observable } from 'rxjs'
import { Asset } from '../../..'
import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPError } from '../../../../utils'
import { FolderId } from '../../explorer'

export class StoryRouter extends Router {
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
    ): Observable<Asset | HTTPError> {
        return this.send$({
            command: 'create',
            path: `/location/${folderId}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }
}
