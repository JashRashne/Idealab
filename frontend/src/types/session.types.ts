export interface Session {
  _id: string
  title: string
  description?: string
  owner_id: string
  is_active: boolean
  participants: string[]
  created_at?: string
  updated_at?: string
}

export interface CreateSessionData {
  title: string
  description?: string
}
