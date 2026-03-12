import json
from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # session_id -> list of active websocket connections
        self.connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str) -> None:
        await websocket.accept()
        self.connections.setdefault(session_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str) -> None:
        conns = self.connections.get(session_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self.connections.pop(session_id, None)

    async def broadcast(self, session_id: str, message: dict) -> None:
        conns = self.connections.get(session_id, [])
        dead: List[WebSocket] = []
        payload = json.dumps(message, default=str)
        for ws in conns:
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
