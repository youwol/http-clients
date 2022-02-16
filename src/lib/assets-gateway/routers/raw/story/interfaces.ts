/**
 * Authors are associated to stories
 *
 * @format
 */

export interface Author {
    authorId: string
}

/**
 * Document describes a tree structure parent-children
 */
export interface Document {
    documentId: string
    title: string
    position: number
    storyId: string
    parentDocumentId: string
}

/**
 * Children documents of a document
 */
export interface DocumentsResponse {
    documents: Document[]
}

/**
 * Story is a wrapper of root document with metadata.
 */
export interface Story {
    storyId: string
    rootDocumentId: string
    title: string
    authors: Author[]
}
