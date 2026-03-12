export interface CommentReaction {
  user_id: string;
  emoji: string;
}

export interface Comment {
  id: string;
  idea_id: string;
  content: string;
  author_id: string;
  reactions: CommentReaction[];
  created_at: string;
}
