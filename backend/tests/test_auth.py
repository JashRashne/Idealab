import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient):
    # 1. Register a new user
    reg_data = {
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "securepassword123"
    }
    response = await client.post("/api/v1/auth/register", json=reg_data)
    assert response.status_code == 201
    user_res = response.json()
    assert user_res["email"] == reg_data["email"]
    assert user_res["username"] == reg_data["username"]
    assert "id" in user_res

    # 2. Login with credentials
    login_data = {
        "email": "testuser@example.com",
        "password": "securepassword123"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    token_res = response.json()
    assert "access_token" in token_res
    assert token_res["token_type"] == "bearer"

    # 3. Get /me with auth token
    headers = {"Authorization": f"Bearer {token_res['access_token']}"}
    response = await client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    me_res = response.json()
    assert me_res["email"] == reg_data["email"]

    # 4. Logout
    response = await client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"
