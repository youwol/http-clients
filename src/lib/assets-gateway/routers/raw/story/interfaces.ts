/**
 * Authors are associated to stories
 *
 */
import { LoadingGraph } from '../flux-project'

export interface AuthorResponse {
    authorId: string
}

/**
 * Document describes a tree structure parent-children
 */
export interface DocumentResponse {
    documentId: string
    title: string
    position: number
    storyId: string
    contentId: string
    parentDocumentId: string
}

/**
 * Children documents of a document
 */
export interface DocumentsResponse {
    documents: DocumentResponse[]
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

/**
 * Content of a document
 */
export interface DocumentContentBody {
    html: string
    css: string
    components: string
    styles: string
}

/**
 * Content of a document
 */
export type DocumentContentResp = DocumentContentBody

export interface StoryRequirements {
    plugins: string[]
    loadingGraph: LoadingGraph
}

export interface PostPluginResponse {
    packageName: string
    version: string
    requirement: StoryRequirements
}
