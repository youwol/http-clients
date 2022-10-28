type Url = string

export interface LoadingGraph {
    graphType: string
    lock: {
        id: string
        name: string
        version: string
        apiKey: string
        exportedSymbol: string
    }[]
    definition: [string, Url][][]
}

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
export type CreateDocumentResponse = GetDocumentResponse
export type UpdateDocumentResponse = GetDocumentResponse
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

export type CreateStoryResponse = StoryResponse

export type PublishStoryResponse = StoryResponse

export type GetStoryResponse = StoryResponse

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
export type UpdateContentBody = DocumentContentBody
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
export type UpgradePluginsBody = Record<string, never>

export interface UpgradePluginsResponse {
    upgradedPlugins: { [k: string]: string }
    requirements: StoryRequirements
}
export type UpdateContentsResponse = Record<string, never>
export type UpdateGlobalContentsResponse = Record<string, never>
export type MoveDocumentResponse = Record<string, never>
export type GetGlobalContentResponse = GlobalContent
