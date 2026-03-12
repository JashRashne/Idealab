import { useState } from "react";

import { createSession } from "../../services/session.service";
import type { Session } from "../../types";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { Modal } from "../shared/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (session: Session) => void;
}

export const CreateSessionModal = ({ open, onClose, onCreated }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (!title.trim()) {
      return;
    }
    const session = await createSession(title.trim(), description.trim());
    onCreated(session);
    onClose();
    setTitle("");
    setDescription("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Session">
      <div className="space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Description</span>
          <textarea
            className="min-h-28 rounded-lg border border-black/20 px-3 py-2 outline-none ring-coral/50 focus:ring"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void submit()}>Create</Button>
        </div>
      </div>
    </Modal>
  );
};
