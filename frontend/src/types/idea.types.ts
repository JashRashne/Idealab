export type IdeaStatus = "active" | "merged" | "archived" | "shortlisted";

export interface Idea {
  id: string;
  session_id: string;
  title: string;
  content: string;
  branch_name: string;
  parent_idea_id: string | null;
  tags: string[];
  status: IdeaStatus;
  created_by: string;
  votes: string[];
  created_at: string;
  updated_at: string;
}

export interface IdeaNode {
  idea: Idea;
  children: IdeaNode[];
}

export interface IdeaCreate {
  session_id: string;
  title: string;
  content: string;
  branch_name: string;
  parent_idea_id?: string | null;
  tags: string[];
}
