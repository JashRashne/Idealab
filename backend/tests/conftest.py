import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.core.config import settings
settings.database_name = "idealab_test"

from app.main import app
from app.db.client import get_database, connect_db, close_db


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture(autouse=True)
async def app_lifespan():
    await connect_db()
    yield
    await close_db()


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    reg_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "Password123!"
    }
    await client.post("/api/v1/auth/register", json=reg_data)
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(autouse=True)
async def clean_db():
    db = get_database()
    if db is not None:
        collections = await db.list_collection_names()
        for col in collections:
            if not col.startswith("system."):
                await db[col].delete_many({})
    yield
    if db is not None:
        collections = await db.list_collection_names()
        for col in collections:
            if not col.startswith("system."):
                await db[col].delete_many({})
