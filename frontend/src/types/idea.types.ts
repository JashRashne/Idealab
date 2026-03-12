export interface Idea {
  _id: string
  title: string
  content: string
  tags: string[]
  session_id: string
  parent_id?: string
  author_id: string
  votes: number
  created_at?: string
  updated_at?: string
}

export interface CreateIdeaData {
  title: string
  content: string
  tags?: string[]
  session_id: string
  parent_id?: string
}

export interface UpdateIdeaData {
  title?: string
  content?: string
  tags?: string[]
}
