import json

from fastapi import WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.websockets.events import WSEventType
from app.websockets.manager import manager


async def websocket_endpoint(websocket: WebSocket, session_id: str, token: str) -> None:
    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    user_id: str = payload.get("sub")
    await manager.connect(websocket, session_id)
    await manager.broadcast(session_id, {
        "type": WSEventType.JOIN,
        "user_id": user_id,
        "participants": manager.get_participant_count(session_id),
    })

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == WSEventType.PING:
                    await manager.send_personal(websocket, {"type": WSEventType.PONG})
                else:
                    message["user_id"] = user_id
                    await manager.broadcast(session_id, message)
            except json.JSONDecodeError:
                await manager.send_personal(websocket, {"type": WSEventType.ERROR, "detail": "Invalid JSON"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        await manager.broadcast(session_id, {
            "type": WSEventType.LEAVE,
            "user_id": user_id,
            "participants": manager.get_participant_count(session_id),
        })
