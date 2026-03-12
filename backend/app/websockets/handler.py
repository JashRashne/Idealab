import json

from fastapi import WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.db.client import get_database
from app.db.repositories.pad_repository import PadRepository
from app.websockets.events import WSEventType
from app.websockets.manager import manager


async def websocket_endpoint(
    websocket: WebSocket, session_id: str, token: str
) -> None:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001, reason="Unauthorized")
        return

    user_id: str = payload.get("sub")
    await manager.connect(websocket, session_id, user_id)

    # Notify everyone (including the joining user) about the updated participant list
    online = manager.get_online_user_ids(session_id)
    await manager.broadcast(
        session_id,
        {"type": WSEventType.USER_JOINED, "payload": {"participant_ids": online}},
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_personal(
                    websocket,
                    {"type": WSEventType.ERROR, "payload": {"detail": "Invalid JSON"}},
                )
                continue

            msg_type = message.get("type")

            if msg_type == WSEventType.PING:
                await manager.send_personal(
                    websocket, {"type": WSEventType.PONG, "payload": {}}
                )

            elif msg_type == WSEventType.JOIN_SESSION:
                # Re-send current participant list to the requesting client
                online = manager.get_online_user_ids(session_id)
                await manager.send_personal(
                    websocket,
                    {
                        "type": WSEventType.USER_JOINED,
                        "payload": {"participant_ids": online},
                    },
                )

            elif msg_type == WSEventType.CURSOR_MOVE:
                db = get_database()
                if db is not None:
                    pad_repo = PadRepository(db)
                    pad = await pad_repo.get(session_id, user_id)
                    if pad and pad.get("is_private", False):
                        continue

                payload = message.get("payload", {})
                x = float(payload.get("x", 0))
                y = float(payload.get("y", 0))
                username = str(payload.get("username", ""))
                await manager.broadcast(
                    session_id,
                    {
                        "type": WSEventType.CURSOR_MOVED,
                        "payload": {
                            "user_id": user_id,
                            "username": username,
                            "x": x,
                            "y": y,
                        },
                    },
                    exclude_user_id=user_id,
                )

            # new_idea / vote / comment are all handled server-side via HTTP routes.
            # Those routes call manager.broadcast() with the authoritative event,
            # so we don't need to re-broadcast client messages here.

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        online = manager.get_online_user_ids(session_id)
        await manager.broadcast(
            session_id,
            {"type": WSEventType.USER_LEFT, "payload": {"participant_ids": online}},
        )
