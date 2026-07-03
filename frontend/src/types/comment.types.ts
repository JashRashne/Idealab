import type { User } from "./user.types";

export interface CommentReaction {
  user_id: string;
  emoji: string;
  reacted_at?: string;
}

export interface Comment {
  id: string;
  idea_id: string;
  content: string;
  author_id: string;
  author?: User;
  reactions: CommentReaction[];
  created_at: string;
}
