import { useEffect, useState } from "react";

import { createComment, getComments } from "../../services/comment.service";
import { updateStatus, voteIdea } from "../../services/idea.service";
import { useIdeaStore } from "../../store/ideaStore";
import type { Comment, IdeaStatus, WSMessage } from "../../types";
import { AIPanel } from "./AIPanel";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";

interface Props {
  sessionId: string;
  sendMessage: (message: WSMessage) => void;
}

export const IdeaDetailPanel = ({ sessionId, sendMessage }: Props) => {
  const idea = useIdeaStore((s) => s.selectedIdea);
  const updateIdea = useIdeaStore((s) => s.updateIdea);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!idea) {
      return;
    }

    const load = async () => {
      const items = await getComments(idea.id);
      setComments(items);
    };

    void load();
  }, [idea]);

  useEffect(() => {
    const reload = () => {
      if (idea) {
        void getComments(idea.id).then(setComments);
      }
    };
    window.addEventListener("idealab:comment-added", reload);
    return () => window.removeEventListener("idealab:comment-added", reload);
  }, [idea]);

  if (!idea) {
    return <div className="p-6 text-sm text-ink/60">Select an idea to inspect and collaborate.</div>;
  }

  const setStatus = async (status: IdeaStatus) => {
    const updated = await updateStatus(idea.id, status);
    updateIdea(updated);
  };

  const onVote = async () => {
    const updated = await voteIdea(idea.id);
    updateIdea(updated);
    sendMessage({ type: "vote", payload: { idea_id: idea.id } });
  };

  const onComment = async () => {
    if (!commentText.trim()) {
      return;
    }
    await createComment(idea.id, commentText.trim());
    sendMessage({ type: "comment", payload: { idea_id: idea.id, content: commentText.trim() } });
    setCommentText("");
    const refreshed = await getComments(idea.id);
    setComments(refreshed);
  };

  return (
    <div className="h-full overflow-auto p-5">
      <h3 className="font-display text-2xl font-bold text-ink">{idea.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{idea.content}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {idea.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <select className="rounded-lg border border-black/20 px-2 py-1 text-sm" value={idea.status} onChange={(e) => void setStatus(e.target.value as IdeaStatus)}>
          <option value="active">active</option>
          <option value="shortlisted">shortlisted</option>
          <option value="merged">merged</option>
          <option value="archived">archived</option>
        </select>
        <Button variant="secondary" onClick={() => void onVote()}>
          Vote ({idea.votes.length})
        </Button>
      </div>

      <AIPanel sessionId={sessionId} />

      <div className="mt-5 border-t border-black/10 pt-4">
        <h4 className="mb-2 font-semibold">Comments</h4>
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-sand p-2 text-sm">
              {comment.content}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            className="flex-1 rounded-lg border border-black/20 px-3 py-2"
          />
          <Button onClick={() => void onComment()}>Send</Button>
        </div>
      </div>
    </div>
  );
};
