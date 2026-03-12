import { create } from 'zustand'
import type { Session } from '../types'

interface SessionState {
  sessions: Session[]
  currentSession: Session | null
  setSessions: (sessions: Session[]) => void
  setCurrentSession: (session: Session | null) => void
  addSession: (session: Session) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) => set((s) => ({ sessions: [...s.sessions, session] })),
}))
