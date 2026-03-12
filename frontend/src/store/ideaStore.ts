import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Idea, IdeaNode } from "../types";
import { FALLBACK_IDEA_TREE } from "../services/fallbackData";

interface IdeaStore {
  ideaTree: IdeaNode[];
  selectedIdea: Idea | null;
  isUsingFallback: boolean;

  setIdeaTree: (ideaTree: IdeaNode[], fromFallback?: boolean) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (idea: Idea) => void;
  setSelectedIdea: (idea: Idea | null) => void;
  initFallback: () => void;
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────
const findInTree = (nodes: IdeaNode[], id: string): boolean => {
  for (const node of nodes) {
    if (node.idea.id === id) return true;
    if (findInTree(node.children, id)) return true;
  }
  return false;
};

const appendChild = (nodes: IdeaNode[], parentId: string, child: IdeaNode): boolean => {
  for (const node of nodes) {
    if (node.idea.id === parentId) {
      node.children = [...node.children, child];
      return true;
    }
    if (appendChild(node.children, parentId, child)) return true;
  }
  return false;
};

const replaceIdea = (nodes: IdeaNode[], idea: Idea): IdeaNode[] =>
  nodes.map((node) => ({
    idea: node.idea.id === idea.id ? idea : node.idea,
    children: replaceIdea(node.children, idea),
  }));

// ─── Store ────────────────────────────────────────────────────────────────────
export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set) => ({
      ideaTree: [],
      selectedIdea: null,
      isUsingFallback: false,

      setIdeaTree: (ideaTree, fromFallback = false) =>
        set({ ideaTree, isUsingFallback: fromFallback }),

      addIdea: (idea) =>
        set((state) => {
          if (findInTree(state.ideaTree, idea.id)) return state; // dedup
          const node: IdeaNode = { idea, children: [] };
          const tree = structuredClone(state.ideaTree);
          if (!idea.parent_idea_id || !appendChild(tree, idea.parent_idea_id, node)) {
            tree.push(node);
          }
          return { ideaTree: tree };
        }),

      updateIdea: (idea) =>
        set((state) => ({
          ideaTree: replaceIdea(state.ideaTree, idea),
          selectedIdea: state.selectedIdea?.id === idea.id ? idea : state.selectedIdea,
        })),

      setSelectedIdea: (selectedIdea) => set({ selectedIdea }),

      // Called when backend is unreachable and store is empty
      initFallback: () =>
        set((state) => {
          if (state.ideaTree.length > 0) return state; // already has data (from localStorage)
          return { ideaTree: FALLBACK_IDEA_TREE, isUsingFallback: true };
        }),
    }),
    {
      name: "idealab-idea-store", // localStorage key
      // Only persist the tree — not selectedIdea or fallback flag
      partialize: (state: IdeaStore) => ({
        ideaTree: state.ideaTree,
      }),
    }
  )
);