export interface Comment {
  _id: string
  content: string
  idea_id: string
  author_id: string
  created_at?: string
  updated_at?: string
}

export interface CreateCommentData {
  content: string
  idea_id: string
}
