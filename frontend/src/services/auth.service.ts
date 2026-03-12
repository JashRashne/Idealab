import api from './api'
import type { LoginCredentials, RegisterData, AuthTokens, User } from '../types'

export const authService = {
  register: async (data: RegisterData): Promise<User> => {
    const res = await api.post('/auth/register', data)
    return res.data
  },
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const res = await api.post('/auth/login', credentials)
    return res.data
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me')
    return res.data
  },
}
