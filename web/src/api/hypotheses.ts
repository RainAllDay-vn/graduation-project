import { apiClient } from './client'

export type HypothesisStatus =
  | 'UNDER_CONSIDERATION'
  | 'CONFIRMED'
  | 'REJECTED'

export interface HypothesisSummary {
  id: number
  rank: number
  matchScore: number
  title: string
  shortTitle: string
  targetType: string
  targetId: string
  status: HypothesisStatus
  cliCommand?: string | null
}

export interface HypothesisDetails extends HypothesisSummary {
  incidentId: string
  sourceNode?: string | null
  targetNode?: string | null
  sourcePort?: string | null
  targetPort?: string | null
  confidenceRationale?: string | null
  rejectionReason?: string | null
  verificationCmd?: string | null
  evidence: string[]
  contradictingEvidence: string[]
  createdAt: string
}

export interface UpdateHypothesisStatusPayload {
  status: HypothesisStatus
  reason?: string
}

/**
 * Retrieve all root-cause hypotheses for an incident, ordered by rank ascending.
 */
export async function getHypotheses(
  incidentId: string,
  status?: HypothesisStatus
): Promise<HypothesisSummary[]> {
  const response = await apiClient.get<HypothesisSummary[]>(
    `/incidents/${encodeURIComponent(incidentId)}/hypotheses`,
    { params: status ? { status } : undefined }
  )
  return response.data
}

/**
 * Retrieve full details for a single hypothesis (evidence, CLI commands, node endpoints).
 */
export async function getHypothesisById(
  incidentId: string,
  hypothesisId: number
): Promise<HypothesisDetails> {
  const response = await apiClient.get<HypothesisDetails>(
    `/incidents/${encodeURIComponent(incidentId)}/hypotheses/${hypothesisId}`
  )
  return response.data
}

/**
 * Update hypothesis verification status (CONFIRMED, REJECTED with reason, or UNDER_CONSIDERATION).
 */
export async function updateHypothesisStatus(
  incidentId: string,
  hypothesisId: number,
  payload: UpdateHypothesisStatusPayload
): Promise<HypothesisDetails> {
  const response = await apiClient.patch<HypothesisDetails>(
    `/incidents/${encodeURIComponent(incidentId)}/hypotheses/${hypothesisId}/status`,
    payload
  )
  return response.data
}
