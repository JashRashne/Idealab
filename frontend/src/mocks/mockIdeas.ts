export const mockIdeaTree = [
  {
    idea: {
      id: "idea-1",
      session_id: "mock-session-id",
      title: "Main Idea",
      content: "This is the main idea.",
      branch_name: "main",
      parent_idea_id: null,
      tags: ["innovation"],
      status: "active",
      created_by: "user-1",
      votes: ["user-2"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    children: [
      {
        idea: {
          id: "idea-2",
          session_id: "mock-session-id",
          title: "Branch Idea",
          content: "A branch from the main idea.",
          branch_name: "branch-1",
          parent_idea_id: "idea-1",
          tags: ["branch"],
          status: "active",
          created_by: "user-2",
          votes: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        children: [],
      },
    ],
  },
];
