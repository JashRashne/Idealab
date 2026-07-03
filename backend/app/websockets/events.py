from enum import Enum


class WSEventType(str, Enum):
    # Client sends these:
    JOIN_SESSION = "join_session"
    NEW_IDEA = "new_idea"
    VOTE = "vote"
    COMMENT = "comment"
    PING = "ping"
    CURSOR_MOVE = "cursor_move"

    # Server sends these:
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    IDEA_ADDED = "idea_added"
    VOTE_UPDATED = "vote_updated"
    COMMENT_ADDED = "comment_added"
    COMMENT_REACTION_UPDATED = "comment_reaction_updated"
    PAD_UPDATED = "pad_updated"
    CURSOR_MOVED = "cursor_moved"
    PONG = "pong"
    ERROR = "error"
