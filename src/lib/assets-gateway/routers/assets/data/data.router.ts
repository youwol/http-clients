import { Observable } from 'rxjs'
import { Router } from '../../../../router'
import {
    CallerRequestOptions,
    HTTPError,
    HTTPResponse$,
    uploadBlob,
} from '../../../../utils'
import { Asset } from '../interfaces'

export class AssetDataRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/data`)
    }

    /**
     * Upload file in YouWol.
     *
     * @param folderId Location of the uploaded data
     * @param fileName file's name
     * @param blob file's content
     * @param callerOptions
     */
    upload$(
        folderId: string,
        fileName: string,
        blob: Blob,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<Asset> {
        return uploadBlob(
            `${this.basePath}/location/${folderId}`,
            fileName,
            'PUT',
            blob,
            {},
            callerOptions,
        ) as Observable<Asset | HTTPError>
    }
}
