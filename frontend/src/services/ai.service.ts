import api from './api'

export interface AIResponse {
  content: string
  model: string
  tokens_used?: number
}

export const aiService = {
  chat: async (prompt: string, context?: string): Promise<AIResponse> => {
    const res = await api.post('/ai/chat', { prompt, context })
    return res.data
  },
  expandIdea: async (title: string, content: string, context?: string): Promise<AIResponse> => {
    const res = await api.post('/ai/expand', { idea_title: title, idea_content: content, context })
    return res.data
  },
  suggestIdeas: async (sessionId: string, existingIdeas: string[]): Promise<AIResponse> => {
    const res = await api.post('/ai/suggest', { session_id: sessionId, existing_ideas: existingIdeas })
    return res.data
  },
}
