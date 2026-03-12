import { useEffect, useState } from "react";

import { createIdea, getIdeaTree, voteIdea } from "../services/idea.service";
import { useIdeaStore } from "../store/ideaStore";
import type { IdeaCreate } from "../types";

export const useIdeas = (sessionId: string) => {
  const ideaTree = useIdeaStore((s) => s.ideaTree);
  const setIdeaTree = useIdeaStore((s) => s.setIdeaTree);
  const addIdea = useIdeaStore((s) => s.addIdea);
  const updateIdeaStore = useIdeaStore((s) => s.updateIdea);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadIdeas = async () => {
      setLoading(true);
      try {
        const tree = await getIdeaTree(sessionId);
        setIdeaTree(tree);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      void loadIdeas();
    }
  }, [sessionId, setIdeaTree]);

  const onCreateIdea = async (payload: IdeaCreate) => {
    const idea = await createIdea(payload);
    addIdea(idea);
    return idea;
  };

  const onVoteIdea = async (ideaId: string) => {
    const updated = await voteIdea(ideaId);
    updateIdeaStore(updated);
    return updated;
  };

  return { ideaTree, loading, createIdea: onCreateIdea, voteIdea: onVoteIdea };
};
