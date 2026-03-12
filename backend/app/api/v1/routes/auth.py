from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.db.client import get_database
from app.db.repositories.user_repository import UserRepository
from app.models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


def get_auth_service(db=Depends(get_database)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, service: AuthService = Depends(get_auth_service)):
    return await service.register(user_data)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, service: AuthService = Depends(get_auth_service)):
    return await service.login(credentials)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
