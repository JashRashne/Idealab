from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from enum import Enum


class TimestampedModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SessionStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"


class IdeaStatus(str, Enum):
    ACTIVE = "active"
    SHORTLISTED = "shortlisted"
    MERGED = "merged"
    ARCHIVED = "archived"