import type { Idea, IdeaNode, Session, Comment } from "../types";

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const FALLBACK_SESSIONS: Session[] = [
  {
    id: "fallback_session_1",
    title: "Product Brainstorm Q1",
    description: "Ideas for the upcoming Q1 product sprint.",
    owner_id: "fallback_user_1",
    participant_ids: ["fallback_user_1", "fallback_user_2"],
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback_session_2",
    title: "UX Redesign Session",
    description: "Exploring new UX patterns for the dashboard.",
    owner_id: "fallback_user_1",
    participant_ids: ["fallback_user_1"],
    status: "active",
    created_at: new Date().toISOString(),
  },
];

// ─── Ideas ────────────────────────────────────────────────────────────────────
export const FALLBACK_IDEAS: Idea[] = [
  {
    id: "fallback_idea_1",
    session_id: "fallback_session_1",
    title: "Dark Mode Support",
    content: "Add a system-aware dark/light mode toggle across all pages.",
    branch_name: "ui-improvements",
    parent_idea_id: null,
    tags: ["ui", "accessibility"],
    status: "shortlisted",
    created_by: "fallback_user_1",
    votes: ["fallback_user_1", "fallback_user_2"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback_idea_2",
    session_id: "fallback_session_1",
    title: "AI Summarize Button",
    content: "One-click session summary using the AI service at the end of every session.",
    branch_name: "ai-features",
    parent_idea_id: null,
    tags: ["ai", "productivity"],
    status: "shortlisted",
    created_by: "fallback_user_2",
    votes: ["fallback_user_1"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback_idea_3",
    session_id: "fallback_session_1",
    title: "Offline Mode",
    content: "Allow users to keep working offline with changes syncing on reconnect.",
    branch_name: "infrastructure",
    parent_idea_id: null,
    tags: ["offline", "sync"],
    status: "active",
    created_by: "fallback_user_1",
    votes: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback_idea_4",
    session_id: "fallback_session_1",
    title: "Voice Input",
    content: "Let users speak their ideas aloud instead of typing.",
    branch_name: "ai-features",
    parent_idea_id: "fallback_idea_2",
    tags: ["voice", "ai"],
    status: "active",
    created_by: "fallback_user_2",
    votes: ["fallback_user_2"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const FALLBACK_IDEA_TREE: IdeaNode[] = [
  {
    idea: FALLBACK_IDEAS[0],
    children: [],
  },
  {
    idea: FALLBACK_IDEAS[1],
    children: [
      {
        idea: FALLBACK_IDEAS[3],
        children: [],
      },
    ],
  },
  {
    idea: FALLBACK_IDEAS[2],
    children: [],
  },
];

// ─── Comments ─────────────────────────────────────────────────────────────────
export const FALLBACK_COMMENTS: Comment[] = [
  {
    id: "fallback_comment_1",
    idea_id: "fallback_idea_1",
    content: "This is a great idea, we should prioritise it.",
    author_id: "fallback_user_2",
    reactions: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback_comment_2",
    idea_id: "fallback_idea_2",
    content: "Could integrate with the Groq summarizer we already have.",
    author_id: "fallback_user_1",
    reactions: [],
    created_at: new Date().toISOString(),
  },
];