export type WSEventType =
  | "join_session"
  | "new_idea"
  | "idea_added"
  | "vote"
  | "vote_updated"
  | "comment"
  | "comment_added"
  | "comment_reaction_updated"
  | "user_joined"
  | "user_left"
  | "pad_updated"
  | "cursor_move"
  | "cursor_moved"
  | "ping"
  | "pong"
  | "error";

export interface WSMessage {
  type: WSEventType;
  payload: Record<string, unknown>;
}
