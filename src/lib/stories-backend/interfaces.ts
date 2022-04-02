import { LoadingGraph } from '../assets-gateway'

export interface AuthorResponse {
    authorId: string
}

export interface HealthzResponse {
    status: 'stories-backend serving'
}

/**
 * Story is a wrapper of root document with metadata.
 */
export interface StoryResponse {
    storyId: string
    rootDocumentId: string
    title: string
    authors: AuthorResponse[]
    requirements: StoryRequirements
}

export interface StoryRequirements {
    plugins: string[]
    loadingGraph: LoadingGraph
}

export interface GlobalContent {
    css: string
    javascript: string
    components: string
}
export interface PostGlobalContentBody {
    css?: string
    javascript?: string
    components?: string
}
export interface GetGlobalContentResponse extends GlobalContent {}
