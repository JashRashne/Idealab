export enum WSEventType {
  JOIN = 'join',
  LEAVE = 'leave',
  IDEA_CREATED = 'idea:created',
  IDEA_UPDATED = 'idea:updated',
  IDEA_DELETED = 'idea:deleted',
  IDEA_VOTED = 'idea:voted',
  COMMENT_ADDED = 'comment:added',
  COMMENT_DELETED = 'comment:deleted',
  AI_RESPONSE = 'ai:response',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong',
}

export interface WSMessage {
  type: WSEventType
  [key: string]: unknown
}
