import api from './api'
import type { Comment, CreateCommentData } from '../types'

export const commentService = {
  getIdeaComments: async (ideaId: string): Promise<Comment[]> => {
    const res = await api.get(`/comments/idea/${ideaId}`)
    return res.data
  },
  addComment: async (data: CreateCommentData): Promise<Comment> => {
    const res = await api.post('/comments', data)
    return res.data
  },
  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`)
  },
}
