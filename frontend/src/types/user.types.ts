export interface User {
  _id: string
  email: string
  username: string
  display_name?: string
  created_at?: string
  updated_at?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  display_name?: string
}
