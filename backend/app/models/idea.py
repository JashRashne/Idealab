from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.common import TimestampedModel


class IdeaBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []


class IdeaCreate(IdeaBase):
    session_id: str
    parent_id: Optional[str] = None


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class IdeaResponse(IdeaBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = Field(None, alias="_id")
    session_id: str
    parent_id: Optional[str] = None
    author_id: str
    votes: int = 0
