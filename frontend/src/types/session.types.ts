export type SessionStatus = "active" | "closed";

export interface Session {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  participant_ids: string[];
  status: SessionStatus;
  created_at: string;
}
