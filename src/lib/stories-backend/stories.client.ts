import { CallerRequestOptions, HTTPResponse$ } from '../utils'
import {
    GetGlobalContentResponse,
    HealthzResponse,
    PostGlobalContentBody,
    StoryResponse,
} from './interfaces'
import { RootRouter } from '../router'

export class StoriesClient extends RootRouter {
    constructor({
        headers,
        basePath,
    }: {
        headers?: { [_key: string]: string }
        basePath?: string
    } = {}) {
        super({
            basePath: basePath || '/api/stories-backend',
            headers,
        })
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<HealthzResponse> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }

    /**
     * Get a specific story.
     *
     * @param storyId
     * @param callerOptions
     */
    getStory$(
        storyId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<StoryResponse> {
        return this.send$({
            command: 'query',
            path: `/stories/${storyId}`,
            callerOptions,
        })
    }

    /**
     * Get global contents (css, javascript, components) of a story
     *
     * @param storyId storyId
     * @param callerOptions
     */
    getGlobalContents$(
        storyId: string,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetGlobalContentResponse> {
        return this.send$({
            command: 'query',
            path: `/stories/${storyId}/global-contents`,
            callerOptions,
        })
    }

    /**
     * Update global contents (css, javascript, components) of a story
     *
     * @param storyId storyId
     * @param body body
     * @param callerOptions
     */
    updateGlobalContents$(
        storyId: string,
        body: PostGlobalContentBody,
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetGlobalContentResponse> {
        return this.send$({
            command: 'update',
            path: `/stories/${storyId}/global-contents`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }
}
