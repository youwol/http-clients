import { Asset } from '../../..'
import { Router } from '../../../../router'
import { CallerRequestOptions, HTTPResponse$ } from '../../../../utils'
import { FolderId } from '../../explorer'

export class AssetFluxProjectRouter extends Router {
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
    ): HTTPResponse$<Asset> {
        return this.send$({
            command: 'create',
            path: `/location/${folderId}`,
            nativeRequestOptions: { json: body },
            callerOptions,
        })
    }
}
