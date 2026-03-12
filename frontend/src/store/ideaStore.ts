import { create } from 'zustand'
import type { Idea } from '../types'

interface IdeaState {
  ideas: Idea[]
  selectedIdea: Idea | null
  setIdeas: (ideas: Idea[]) => void
  setSelectedIdea: (idea: Idea | null) => void
  addIdea: (idea: Idea) => void
  updateIdea: (id: string, updated: Partial<Idea>) => void
  removeIdea: (id: string) => void
}

export const useIdeaStore = create<IdeaState>((set) => ({
  ideas: [],
  selectedIdea: null,
  setIdeas: (ideas) => set({ ideas }),
  setSelectedIdea: (idea) => set({ selectedIdea: idea }),
  addIdea: (idea) => set((s) => ({ ideas: [...s.ideas, idea] })),
  updateIdea: (id, updated) =>
    set((s) => ({ ideas: s.ideas.map((i) => (i._id === id ? { ...i, ...updated } : i)) })),
  removeIdea: (id) =>
    set((s) => ({ ideas: s.ideas.filter((i) => i._id !== id) })),
}))
