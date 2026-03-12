import api from './api'
import type { Session, CreateSessionData } from '../types'

export const sessionService = {
  getSessions: async (): Promise<Session[]> => {
    const res = await api.get('/sessions')
    return res.data
  },
  getSession: async (id: string): Promise<Session> => {
    const res = await api.get(`/sessions/${id}`)
    return res.data
  },
  createSession: async (data: CreateSessionData): Promise<Session> => {
    const res = await api.post('/sessions', data)
    return res.data
  },
  joinSession: async (sessionId: string): Promise<Session> => {
    const res = await api.post(`/sessions/${sessionId}/join`)
    return res.data
  },
}
