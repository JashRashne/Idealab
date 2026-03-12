import api from "./api";
import type { Idea } from "../types";
import { findIdeaInTree, flattenTree } from "./idea.service";
import { useIdeaStore } from "../store/ideaStore";

export interface AIJob {
  id: string;
  session_id: string;
  type: "expand" | "summarize" | "merge";
  input_idea_ids: string[];
  output: string;
  created_at: string;
}

const generateId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

// ─── expandIdea ───────────────────────────────────────────────────────────────
export const expandIdea = async (ideaId: string): Promise<AIJob> => {
  try {
    const { data } = await api.post<AIJob>("/ai/expand", { idea_id: ideaId });
    return data;
  } catch {
    const idea = findIdeaInTree(useIdeaStore.getState().ideaTree, ideaId);
    const title = idea?.title ?? "this idea";
    return {
      id: generateId(),
      session_id: idea?.session_id ?? "local",
      type: "expand",
      input_idea_ids: [ideaId],
      output: `**Expansion of "${title}"**\n\n` +
        `This concept could be developed in several directions:\n\n` +
        `1. **Core feature** — Implement the basic version first to validate demand.\n` +
        `2. **Variations** — Consider a lightweight version for mobile and a full version for desktop.\n` +
        `3. **Integration** — This could tie into the existing workflow to reduce friction.\n` +
        `4. **Metrics** — Track adoption via usage events to measure real impact.\n\n` +
        `*(Generated locally — backend unavailable)*`,
      created_at: now(),
    };
  }
};

// ─── summarizeSession ─────────────────────────────────────────────────────────
export const summarizeSession = async (sessionId: string): Promise<AIJob> => {
  try {
    const { data } = await api.post<AIJob>("/ai/summarize", { session_id: sessionId });
    return data;
  } catch {
    const allIdeas = flattenTree(useIdeaStore.getState().ideaTree).filter(
      (i) => i.session_id === sessionId
    );
    const titles = allIdeas.map((i) => `- ${i.title}`).join("\n");
    return {
      id: generateId(),
      session_id: sessionId,
      type: "summarize",
      input_idea_ids: allIdeas.map((i) => i.id),
      output: `**Session Summary**\n\n` +
        `This session explored ${allIdeas.length} idea${allIdeas.length !== 1 ? "s" : ""}:\n\n` +
        `${titles || "- No ideas yet"}\n\n` +
        `Key themes: collaboration, innovation, and iterative improvement.\n\n` +
        `*(Generated locally — backend unavailable)*`,
      created_at: now(),
    };
  }
};

// ─── mergeIdeas ───────────────────────────────────────────────────────────────
export const mergeIdeas = async (ideaId1: string, ideaId2: string): Promise<Idea> => {
  try {
    const { data } = await api.post<Idea>("/ai/merge", {
      idea_id_1: ideaId1,
      idea_id_2: ideaId2,
    });
    useIdeaStore.getState().addIdea(data);
    return data;
  } catch {
    const tree = useIdeaStore.getState().ideaTree;
    const idea1 = findIdeaInTree(tree, ideaId1);
    const idea2 = findIdeaInTree(tree, ideaId2);

    const mergedIdea: Idea = {
      id: generateId(),
      session_id: idea1?.session_id ?? "local",
      title: `${idea1?.title ?? "Idea 1"} + ${idea2?.title ?? "Idea 2"}`,
      content:
        `**Merged concept** combining "${idea1?.title ?? "Idea 1"}" and "${idea2?.title ?? "Idea 2"}".\n\n` +
        `${idea1?.content ?? ""}\n\n${idea2?.content ?? ""}\n\n` +
        `*(Merged locally — backend unavailable)*`,
      branch_name: "merged-branch",
      parent_idea_id: ideaId1,
      tags: [...new Set([...(idea1?.tags ?? []), ...(idea2?.tags ?? []), "merged"])],
      status: "merged",
      created_by: "local_user",
      votes: [],
      created_at: now(),
      updated_at: now(),
    };

    useIdeaStore.getState().addIdea(mergedIdea);
    return mergedIdea;
  }
};