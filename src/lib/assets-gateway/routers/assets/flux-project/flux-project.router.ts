/** @format */

import { Observable } from 'rxjs'
import { Asset } from '../../..'
import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPError } from '../../../../utils'
import { FolderId } from '../../explorer'

export class FluxProjectRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/flux-project`)
    }

    /**
     * Create an empty flux project.
     *
     * @param folderId Location of the created flux-project
     * @param body
     * @param body.name name of the project
     * @param body.description description
     * @param callerOptions
     */
    create$(
        folderId: FolderId,
        body: { name: string; description: string },
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
