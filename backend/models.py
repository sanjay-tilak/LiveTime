"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class MessageStatus(str, Enum):
    new = "new"
    replied = "replied"
    accepted = "accepted"
    declined = "declined"


# ─── Thread Messages ─────────────────────────────────────────────────────────

class ThreadMessageOut(BaseModel):
    """A single message within a conversation thread."""
    id: str
    sender: str
    sender_initials: str = Field(alias="sender_initials")
    sender_color: str = Field(alias="sender_color")
    content: str
    timestamp: str
    is_own: bool = Field(alias="is_own")

    model_config = {"populate_by_name": True}


class ThreadMessageCreate(BaseModel):
    """Payload for sending a reply."""
    content: str
    sender: str = "You"
    sender_initials: str = "B"
    sender_color: str = "bg-pink-500"


# ─── Messages ────────────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    """A conversation/message in the inbox list."""
    id: str
    sender: str
    sender_role: str = Field(alias="sender_role")
    sender_initials: str = Field(alias="sender_initials")
    sender_color: str = Field(alias="sender_color")
    subject: str
    preview: str
    full_message: str = Field(alias="full_message")
    timestamp: str
    date: str
    read: bool
    starred: bool
    status: MessageStatus
    partnership_type: str = Field(alias="partnership_type")

    model_config = {"populate_by_name": True}


class MessageDetail(MessageOut):
    """A message with its full thread attached."""
    thread: list[ThreadMessageOut] = []


class MessageUpdate(BaseModel):
    """Partial update payload for a message."""
    read: Optional[bool] = None
    starred: Optional[bool] = None
    status: Optional[MessageStatus] = None


# ─── Stats ────────────────────────────────────────────────────────────────────

class InboxStats(BaseModel):
    """Aggregate stats for the inbox."""
    total: int
    unread: int
    starred: int
    new: int
    replied: int
    accepted: int
    declined: int
