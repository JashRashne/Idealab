from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.common import TimestampedModel


class UserBase(BaseModel):
    email: EmailStr
    username: str
    display_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserInDB(UserBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = None
    hashed_password: str
    is_active: bool = True
