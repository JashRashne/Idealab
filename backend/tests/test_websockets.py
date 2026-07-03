import pytest
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocketDisconnect

from app.main import app

def test_ws_connection_unauthorized():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/test-session?token=bad") as websocket:
            msg = websocket.receive_json()
            assert msg["type"] == "error"
            assert msg["payload"]["detail"] == "Unauthorized"
            
            with pytest.raises(WebSocketDisconnect) as exc:
                websocket.receive_json()
            assert exc.value.code == 1008

def test_ws_broadcast_idea():
    with TestClient(app) as client:
        # 1. Register and login User 1 to get token
        reg1 = {"email": "u1@example.com", "username": "u1", "password": "Password123!"}
        client.post("/api/v1/auth/register", json=reg1)
        login1 = client.post("/api/v1/auth/login", json={"email": "u1@example.com", "password": "Password123!"}).json()
        token1 = login1["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}

        # 2. Register and login User 2 to get token
        reg2 = {"email": "u2@example.com", "username": "u2", "password": "Password123!"}
        client.post("/api/v1/auth/register", json=reg2)
        login2 = client.post("/api/v1/auth/login", json={"email": "u2@example.com", "password": "Password123!"}).json()
        token2 = login2["access_token"]

        # 3. User 1 creates a session
        session = client.post("/api/v1/sessions/", json={"title": "Sprint", "description": ""}, headers=headers1).json()
        session_id = session["id"]

        # 4. User 2 joins the session
        client.post(f"/api/v1/sessions/{session_id}/join", headers={"Authorization": f"Bearer {token2}"})

        # 5. Connect User 2 to the WebSocket
        with client.websocket_connect(f"/ws/{session_id}?token={token2}") as ws2:
            # First message is user_joined notification
            msg = ws2.receive_json()
            assert msg["type"] == "user_joined"
            assert "participant_ids" in msg["payload"]

            # 6. User 1 creates an idea via HTTP
            idea_data = {
                "session_id": session_id,
                "title": "New WS Idea",
                "content": "Real-time content",
                "branch_name": "main",
                "tags": []
            }
            client.post("/api/v1/ideas/", json=idea_data, headers=headers1)

            # 7. User 2 should receive the idea_added event!
            broadcasted = ws2.receive_json()
            assert broadcasted["type"] == "idea_added"
            assert broadcasted["payload"]["idea"]["title"] == "New WS Idea"
