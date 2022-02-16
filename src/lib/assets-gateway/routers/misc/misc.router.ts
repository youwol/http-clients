/** @format */

import { CallerRequestOptions, HTTPResponse$ } from '../../../utils'
import { Router } from '../../../router'
import { EmojisResponse } from './interfaces'

/**
 * Miscellaneous stuffs
 */
export class MiscRouter extends Router {
    constructor(parent: Router) {
        super(parent.headers, `${parent.basePath}/misc`)
    }

    /**
     * Query emojis of a particular category.
     *
     * @param category category of the emoji in ["smileys_people", "animals", "foods", "activities", "travel",
     * "objects", "symbols", "flags" ]
     * @param callerOptions
     */
    queryEmojis$(
        category: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<EmojisResponse> {
        return this.send$({
            command: 'query',
            path: `/emojis/${category}`,
            callerOptions,
        })
    }
}
