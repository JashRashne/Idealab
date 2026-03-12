from enum import Enum


class WSEventType(str, Enum):
    # Connection
    JOIN = "join"
    LEAVE = "leave"

    # Ideas
    IDEA_CREATED = "idea:created"
    IDEA_UPDATED = "idea:updated"
    IDEA_DELETED = "idea:deleted"
    IDEA_VOTED = "idea:voted"

    # Comments
    COMMENT_ADDED = "comment:added"
    COMMENT_DELETED = "comment:deleted"

    # AI
    AI_RESPONSE = "ai:response"

    # System
    ERROR = "error"
    PING = "ping"
    PONG = "pong"
