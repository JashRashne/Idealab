from typing import Optional

from app.db.repositories.pad_repository import PadRepository


class PadService:
    def __init__(self, repo: PadRepository):
        self.repo = repo

    async def update_pad(
        self, session_id: str, user_id: str, content: str
    ) -> dict:
        return await self.repo.upsert(session_id, user_id, content)

    async def get_pad(self, session_id: str, user_id: str) -> Optional[dict]:
        return await self.repo.get(session_id, user_id)
