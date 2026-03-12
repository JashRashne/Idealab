import json
from typing import Dict, List, Optional

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # session_id -> list of active websocket connections
        self.connections: Dict[str, List[WebSocket]] = {}
        # id(websocket) -> user_id
        self.ws_user: Dict[int, str] = {}

    async def connect(
        self, websocket: WebSocket, session_id: str, user_id: str
    ) -> None:
        await websocket.accept()
        self.connections.setdefault(session_id, []).append(websocket)
        self.ws_user[id(websocket)] = user_id

    def disconnect(self, websocket: WebSocket, session_id: str) -> None:
        conns = self.connections.get(session_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self.connections.pop(session_id, None)
        self.ws_user.pop(id(websocket), None)

    def get_online_user_ids(self, session_id: str) -> List[str]:
        conns = self.connections.get(session_id, [])
        seen: set = set()
        users: List[str] = []
        for ws in conns:
            uid = self.ws_user.get(id(ws))
            if uid and uid not in seen:
                users.append(uid)
                seen.add(uid)
        return users

    async def broadcast(
        self,
        session_id: str,
        message: dict,
        exclude_user_id: Optional[str] = None,
    ) -> None:
        conns = self.connections.get(session_id, [])
        dead: List[WebSocket] = []
        payload = json.dumps(message, default=str)
        for ws in conns:
            if exclude_user_id and self.ws_user.get(id(ws)) == exclude_user_id:
                continue
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, session_id)

    async def send_personal(self, websocket: WebSocket, message: dict) -> None:
        await websocket.send_text(json.dumps(message, default=str))

    def get_participant_count(self, session_id: str) -> int:
        return len(self.connections.get(session_id, []))


manager = ConnectionManager()
