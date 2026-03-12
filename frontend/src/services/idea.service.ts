import api from './api'
import type { Idea, CreateIdeaData, UpdateIdeaData } from '../types'

export const ideaService = {
  getSessionIdeas: async (sessionId: string): Promise<Idea[]> => {
    const res = await api.get(`/ideas/session/${sessionId}`)
    return res.data
  },
  createIdea: async (data: CreateIdeaData): Promise<Idea> => {
    const res = await api.post('/ideas', data)
    return res.data
  },
  updateIdea: async (id: string, data: UpdateIdeaData): Promise<Idea> => {
    const res = await api.patch(`/ideas/${id}`, data)
    return res.data
  },
  deleteIdea: async (id: string): Promise<void> => {
    await api.delete(`/ideas/${id}`)
  },
  voteIdea: async (id: string): Promise<Idea> => {
    const res = await api.post(`/ideas/${id}/vote`)
    return res.data
  },
}
