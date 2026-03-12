from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.db.repositories.user_repository import UserRepository
from app.models.user import UserCreate, UserLogin, TokenResponse


class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def register(self, user_data: UserCreate) -> dict:
        if await self.repo.get_by_email(user_data.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        if await self.repo.get_by_username(user_data.username):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        data = user_data.model_dump()
        data["hashed_password"] = hash_password(data.pop("password"))
        data["email"] = data["email"].lower()
        data["is_active"] = True
        return await self.repo.create(data)

    async def login(self, credentials: UserLogin) -> TokenResponse:
        user = await self.repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user["hashed_password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        token_data = {"sub": user["id"]}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )
