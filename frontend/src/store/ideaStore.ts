import { create } from "zustand";

import type { Idea, IdeaNode } from "../types";

interface IdeaStore {
  ideaTree: IdeaNode[];
  selectedIdea: Idea | null;
  setIdeaTree: (ideaTree: IdeaNode[]) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (idea: Idea) => void;
  setSelectedIdea: (idea: Idea | null) => void;
}

const appendChild = (nodes: IdeaNode[], parentId: string, child: IdeaNode): boolean => {
  for (const node of nodes) {
    if (node.idea.id === parentId) {
      node.children = [...node.children, child];
      return true;
    }
    if (appendChild(node.children, parentId, child)) {
      return true;
    }
  }
  return false;
};

const replaceIdea = (nodes: IdeaNode[], idea: Idea): IdeaNode[] => {
  return nodes.map((node) => ({
    idea: node.idea.id === idea.id ? idea : node.idea,
    children: replaceIdea(node.children, idea)
  }));
};

export const useIdeaStore = create<IdeaStore>((set) => ({
  ideaTree: [],
  selectedIdea: null,
  setIdeaTree: (ideaTree) => set({ ideaTree }),
  addIdea: (idea) =>
    set((state) => {
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
      selectedIdea: state.selectedIdea?.id === idea.id ? idea : state.selectedIdea
    })),
  setSelectedIdea: (selectedIdea) => set({ selectedIdea })
}));
