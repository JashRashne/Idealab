import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_ideas_flow(client: AsyncClient, auth_headers: dict):
    # 1. Create a session first
    session_data = {
        "title": "Design Sprint",
        "description": "Brainstorming new features"
    }
    response = await client.post("/api/v1/sessions/", json=session_data, headers=auth_headers)
    assert response.status_code == 201
    session_res = response.json()
    session_id = session_res["id"]
    assert session_res["title"] == session_data["title"]
    assert session_res["status"] == "active"

    # 2. Create an idea under this session
    idea_data = {
        "session_id": session_id,
        "title": "Dark Mode Support",
        "content": "Add system-wide dark mode support with automatic scheduling.",
        "branch_name": "main",
        "tags": ["ui", "accessibility"]
    }
    response = await client.post("/api/v1/ideas/", json=idea_data, headers=auth_headers)
    assert response.status_code == 201
    idea_res = response.json()
    idea_id = idea_res["id"]
    assert idea_res["title"] == idea_data["title"]
    assert idea_res["content"] == idea_data["content"]
    assert idea_res["status"] == "active"
    assert len(idea_res["votes"]) == 0

    # 3. Vote for the idea (first time should add user to votes)
    response = await client.post(f"/api/v1/ideas/{idea_id}/vote", headers=auth_headers)
    assert response.status_code == 200
    idea_res = response.json()
    assert len(idea_res["votes"]) == 1

    # 4. Vote again (second time should pull user from votes)
    response = await client.post(f"/api/v1/ideas/{idea_id}/vote", headers=auth_headers)
    assert response.status_code == 200
    idea_res = response.json()
    assert len(idea_res["votes"]) == 0

    # 5. Update idea status to shortlisted
    response = await client.patch(f"/api/v1/ideas/{idea_id}/status?status=shortlisted", headers=auth_headers)
    assert response.status_code == 200
    idea_res = response.json()
    assert idea_res["status"] == "shortlisted"

    # 6. Fetch idea tree
    response = await client.get(f"/api/v1/ideas/tree/{session_id}")
    assert response.status_code == 200
    tree_res = response.json()
    assert len(tree_res) == 1
    assert tree_res[0]["idea"]["id"] == idea_id
