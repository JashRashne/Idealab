from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.common import TimestampedModel


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    idea_id: str


class CommentResponse(CommentBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = Field(None, alias="_id")
    idea_id: str
    author_id: str
