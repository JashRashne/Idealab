from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.common import TimestampedModel


class SessionBase(BaseModel):
    title: str
    description: Optional[str] = None


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SessionResponse(SessionBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = Field(None, alias="_id")
    owner_id: str
    is_active: bool = True
    participants: List[str] = []
