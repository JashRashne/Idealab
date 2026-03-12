import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ideaService } from '../services/idea.service'
import type { CreateIdeaData, UpdateIdeaData } from '../types'

export function useSessionIdeas(sessionId: string) {
  return useQuery({
    queryKey: ['ideas', sessionId],
    queryFn: () => ideaService.getSessionIdeas(sessionId),
    enabled: !!sessionId,
  })
}

export function useCreateIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateIdeaData) => ideaService.createIdea(data),
    onSuccess: (idea) => qc.invalidateQueries({ queryKey: ['ideas', idea.session_id] }),
  })
}

export function useVoteIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ideaService.voteIdea(id),
    onSuccess: (idea) => qc.invalidateQueries({ queryKey: ['ideas', idea.session_id] }),
  })
}
