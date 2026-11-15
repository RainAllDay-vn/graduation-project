import { apiClient } from './client'

export type DocType =
  | 'OPERATION_RUNBOOK'
  | 'VENDOR_SPECIFICATION'
  | 'POST_MORTEM_REPORT'

export type DocumentSource =
  | 'MANUAL'
  | 'INTERNAL_WIKI'
  | 'CONFLUENCE'
  | 'OPERATIONS_DRIVE'

export type IndexingStatus = 'INDEXING' | 'READY' | 'FAILED'

export interface DocumentSummary {
  id: string
  title: string
  source: DocumentSource
  docType: DocType
  fileName: string
  fileFormat: string
  fileSizeBytes: number
  version: number
  indexingStatus: IndexingStatus
  statusReason?: string | null
  updatedAt: string
}

export interface DocumentDetails {
  id: string
  title: string
  source: DocumentSource
  docType: DocType
  fileName: string
  fileFormat: string
  fileSizeBytes: number
  version: number
  indexingStatus: IndexingStatus
  statusReason?: string | null
  content?: string | null
  downloadUrl?: string
  createdAt: string
  updatedAt: string
}

export interface GetDocumentsParams {
  q?: string
  type?: DocType
  status?: IndexingStatus
  source?: DocumentSource
}

export interface UploadDocumentParams {
  title: string
  docType?: DocType
  source?: DocumentSource
  file?: File | Blob
}

export interface ReplaceDocumentFileParams {
  id: string
  file: File | Blob
}

/**
 * Retrieve documents, optionally filtered by free-text search, type, status, or source.
 */
export async function getDocuments(
  params?: GetDocumentsParams
): Promise<DocumentSummary[]> {
  const response = await apiClient.get<DocumentSummary[]>('/documents', {
    params,
  })
  return response.data
}

/**
 * Retrieve full details of a document by ID, including extracted text content.
 */
export async function getDocumentById(id: string): Promise<DocumentDetails> {
  const response = await apiClient.get<DocumentDetails>(`/documents/${id}`)
  return response.data
}

/**
 * Upload a new technical knowledge document (.md, .txt, etc.).
 */
export async function uploadDocument(
  params: UploadDocumentParams
): Promise<DocumentDetails> {
  const formData = new FormData()
  formData.append('title', params.title)
  if (params.docType) {
    formData.append('docType', params.docType)
  }
  if (params.source) {
    formData.append('source', params.source)
  }
  if (params.file) {
    formData.append('file', params.file)
  }

  const response = await apiClient.post<DocumentDetails>('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Replace the file of an existing document.
 * The previous version is retained on storage and indexing restarts.
 */
export async function replaceDocumentFile(
  params: ReplaceDocumentFileParams
): Promise<DocumentDetails> {
  const formData = new FormData()
  formData.append('file', params.file)

  const response = await apiClient.put<DocumentDetails>(
    `/documents/${params.id}/file`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

/**
 * Delete a document and all stored versions of its file.
 */
export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`)
}

/**
 * Helper to construct the direct download URL for a document.
 */
export function getDocumentDownloadUrl(id: string): string {
  return `/api/documents/${id}/download`
}
