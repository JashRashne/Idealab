import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '../services/session.service'
import type { CreateSessionData } from '../types'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getSessions,
  })
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionService.getSession(id),
    enabled: !!id,
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSessionData) => sessionService.createSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}
