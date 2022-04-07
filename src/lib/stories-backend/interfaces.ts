import { LoadingGraph } from '../assets-gateway'

export interface AuthorResponse {
    authorId: string
}

export interface HealthzResponse {
    status: 'stories-backend serving'
}

export interface UpdateDocumentBody {
    title: string
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

export interface DeleteStoryResponse {
    pass
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
    requirements: StoryRequirements
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
export interface DocumentContentBody {
    html: string
    css: string
    components: string
    styles: string
}
export interface DeleteDocumentResponse {
    deletedDocuments: number
}
export interface MoveDocumentBody {
    parent: string
    position: number
}
export interface AddPluginBody {
    packageName: string
}

export interface MoveDocumentResponse {}
export interface GetGlobalContentResponse extends GlobalContent {}
