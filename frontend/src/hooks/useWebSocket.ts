import { useEffect, useRef, useState } from "react";

import { useIdeaStore } from "../store/ideaStore";
import { useSessionStore } from "../store/sessionStore";
import type { Idea, WSMessage } from "../types";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

const isWSMessage = (value: unknown): value is WSMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const message = value as { type?: unknown; payload?: unknown };
  return typeof message.type === "string" && typeof message.payload === "object" && message.payload !== null;
};

const extractIdea = (payload: Record<string, unknown>): Idea | null => {
  const candidate = payload.idea;
  if (!candidate || typeof candidate !== "object") {
    return null;
  }
  return candidate as Idea;
};

export const useWebSocket = (sessionId: string, userId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

  const addIdea = useIdeaStore((s) => s.addIdea);
  const updateIdea = useIdeaStore((s) => s.updateIdea);
  const setOnlineParticipants = useSessionStore((s) => s.setOnlineParticipants);

  useEffect(() => {
    if (!sessionId || !userId) {
      return;
    }

    let mounted = true;
    const wsBase = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
    const token = localStorage.getItem("access_token") ?? "";

    const connect = () => {
      if (!mounted) {
        return;
      }

      setConnectionStatus("connecting");
      const ws = new WebSocket(`${wsBase}/${sessionId}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setConnectionStatus("connected");
        ws.send(JSON.stringify({ type: "join_session", payload: { session_id: sessionId, user_id: userId } }));
      };

      ws.onmessage = (event) => {
        const parsed = JSON.parse(event.data) as unknown;
        if (!isWSMessage(parsed)) {
          return;
        }

        setLastMessage(parsed);
        const payload = parsed.payload;

        if (parsed.type === "idea_added") {
          const idea = extractIdea(payload);
          if (idea) {
            addIdea(idea);
          }
        }

        if (parsed.type === "vote_updated") {
          const idea = extractIdea(payload);
          if (idea) {
            updateIdea(idea);
          }
        }

        if (parsed.type === "comment_added") {
          window.dispatchEvent(new CustomEvent("idealab:comment-added"));
        }

        if (parsed.type === "pad_updated") {
          window.dispatchEvent(new CustomEvent("idealab:pad-updated", { detail: payload }));
        }

        if (parsed.type === "cursor_moved") {
          window.dispatchEvent(new CustomEvent("idealab:cursor-moved", { detail: payload }));
        }

        if (parsed.type === "user_joined" || parsed.type === "user_left") {
          const users = payload.participant_ids;
          if (Array.isArray(users)) {
            setOnlineParticipants(users.filter((u): u is string => typeof u === "string"));
          }
        }
      };

      ws.onclose = () => {
        if (!mounted) {
          return;
        }
        setConnectionStatus("disconnected");
        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current += 1;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, userId, addIdea, updateIdea, setOnlineParticipants]);

  const sendMessage = (message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage, lastMessage, connectionStatus };
};
