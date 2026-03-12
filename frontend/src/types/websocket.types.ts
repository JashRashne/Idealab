export type WSEventType =
  | "join_session"
  | "new_idea"
  | "idea_added"
  | "vote"
  | "vote_updated"
  | "comment"
  | "comment_added"
  | "user_joined"
  | "user_left"
  | "error";

export interface WSMessage {
  type: WSEventType;
  payload: Record<string, unknown>;
}
