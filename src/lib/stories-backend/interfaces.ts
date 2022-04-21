import { LoadingGraph } from '../assets-gateway'

export interface AuthorResponse {
    authorId: string
}

export interface GetHealthzResponse {
    status: 'stories-backend serving'
}

export interface UpdateDocumentBody {
    title: string
}
/**
 * Document describes a tree structure parent-children
 */
export interface GetDocumentResponse {
    documentId: string
    title: string
    position: number
    storyId: string
    contentId: string
    parentDocumentId: string
}
export interface CreateDocumentResponse extends GetDocumentResponse {}
export interface UpdateDocumentResponse extends GetDocumentResponse {}
/**
 * Children documents of a document
 */
export interface QueryDocumentsResponse {
    documents: GetDocumentResponse[]
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

export interface CreateStoryResponse extends StoryResponse {}

export interface PublishStoryResponse extends StoryResponse {}

export interface GetStoryResponse extends StoryResponse {}

export interface DeleteStoryResponse {
    pass
}

/**
 * Content of a document
 */
export type GetContentResponse = DocumentContentBody

export interface StoryRequirements {
    plugins: string[]
    loadingGraph: LoadingGraph
}

export interface AddPluginResponse {
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
export interface UpdateGlobalContentBody {
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
export interface CreateBody {
    storyId?: string
    title: string
}
export interface PublishBody {
    fileName: string
    blob: Blob
}
export interface CreateDocumentBody {
    parentDocumentId: string
    title: string
    content?: DocumentContentBody
}
export interface UpdateContentBody extends DocumentContentBody {}
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
export interface UpdateContentsResponse {}
export interface UpdateGlobalContentsResponse {}
export interface MoveDocumentResponse {}
export interface GetGlobalContentResponse extends GlobalContent {}
