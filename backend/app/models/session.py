from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.models.common import TimestampedModel, SessionStatus

if TYPE_CHECKING:
    from app.models.user import UserResponse

class SessionSettings(BaseModel):
    max_participants: int = 50
    time_limit_minutes: Optional[int] = None


class SessionBase(BaseModel):
    title: str
    description: Optional[str] = None
    settings: SessionSettings = Field(default_factory=SessionSettings)


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[SessionStatus] = None
    settings: Optional[SessionSettings] = None


class SessionInDB(SessionBase, TimestampedModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(None, alias="_id")
    owner_id: str
    participant_ids: List[str] = []
    status: SessionStatus = SessionStatus.ACTIVE
    idea_count: int = 0
    ended_at: Optional[datetime] = None


class SessionResponse(SessionInDB):
    pass


class SessionWithParticipants(SessionInDB):
    participants: List["UserResponse"] = []

    model_config = ConfigDict(populate_by_name=True)


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int