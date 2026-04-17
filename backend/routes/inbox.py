"""
Inbox API routes — CRUD operations for messages and threads.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import supabase
from models import (
    MessageOut,
    MessageDetail,
    MessageUpdate,
    ThreadMessageOut,
    ThreadMessageCreate,
    InboxStats,
    MessageStatus,
)

router = APIRouter(prefix="/api/inbox", tags=["inbox"])


# ─── GET /api/inbox/messages ─────────────────────────────────────────────────

@router.get("/messages", response_model=list[MessageOut])
async def list_messages(
    status: Optional[MessageStatus] = Query(None, description="Filter by status"),
    starred: Optional[bool] = Query(None, description="Filter starred messages"),
    read: Optional[bool] = Query(None, description="Filter by read status"),
    search: Optional[str] = Query(None, description="Search sender, subject, preview"),
    limit: int = Query(50, ge=1, le=100, description="Max results to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
):
    """List all inbox messages with optional filters."""
    query = supabase.table("messages").select("*")

    # Apply filters
    if status is not None:
        query = query.eq("status", status.value)
    if starred is not None:
        query = query.eq("starred", starred)
    if read is not None:
        query = query.eq("read", read)
    if search:
        # Use Supabase ilike for case-insensitive search across multiple columns
        search_pattern = f"%{search}%"
        query = query.or_(
            f"sender.ilike.{search_pattern},"
            f"subject.ilike.{search_pattern},"
            f"preview.ilike.{search_pattern}"
        )

    # Order by most recent first, then paginate
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

    response = query.execute()
    return response.data


# ─── GET /api/inbox/messages/{id} ────────────────────────────────────────────

@router.get("/messages/{message_id}", response_model=MessageDetail)
async def get_message(message_id: str):
    """Get a single message with its full thread."""
    # Fetch the message
    msg_response = (
        supabase.table("messages")
        .select("*")
        .eq("id", message_id)
        .execute()
    )

    if not msg_response.data:
        raise HTTPException(status_code=404, detail="Message not found")

    message = msg_response.data[0]

    # Fetch thread messages
    thread_response = (
        supabase.table("thread_messages")
        .select("*")
        .eq("message_id", message_id)
        .order("created_at", desc=False)
        .execute()
    )

    message["thread"] = thread_response.data or []
    return message


# ─── PATCH /api/inbox/messages/{id} ─────────────────────────────────────────

@router.patch("/messages/{message_id}", response_model=MessageOut)
async def update_message(message_id: str, payload: MessageUpdate):
    """Update a message — mark read, toggle star, change status."""
    # Build update dict with only provided fields
    update_data = payload.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Convert enum to string if present
    if "status" in update_data:
        update_data["status"] = update_data["status"].value

    response = (
        supabase.table("messages")
        .update(update_data)
        .eq("id", message_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Message not found")

    return response.data[0]


# ─── POST /api/inbox/messages/{id}/reply ─────────────────────────────────────

@router.post("/messages/{message_id}/reply", response_model=ThreadMessageOut)
async def reply_to_message(message_id: str, payload: ThreadMessageCreate):
    """Add a reply to a message thread."""
    # Verify the message exists
    msg_check = (
        supabase.table("messages")
        .select("id")
        .eq("id", message_id)
        .execute()
    )

    if not msg_check.data:
        raise HTTPException(status_code=404, detail="Message not found")

    # Insert the thread message
    thread_data = {
        "message_id": message_id,
        "sender": payload.sender,
        "sender_initials": payload.sender_initials,
        "sender_color": payload.sender_color,
        "content": payload.content,
        "timestamp": "Just now",
        "is_own": True,
    }

    thread_response = (
        supabase.table("thread_messages")
        .insert(thread_data)
        .execute()
    )

    if not thread_response.data:
        raise HTTPException(status_code=500, detail="Failed to create reply")

    # Update message status to "replied"
    supabase.table("messages").update({"status": "replied"}).eq("id", message_id).execute()

    return thread_response.data[0]


# ─── DELETE /api/inbox/messages/{id} ─────────────────────────────────────────

@router.delete("/messages/{message_id}")
async def delete_message(message_id: str):
    """Delete a message and its thread."""
    # Delete thread messages first (child records)
    supabase.table("thread_messages").delete().eq("message_id", message_id).execute()

    # Delete the message
    response = (
        supabase.table("messages")
        .delete()
        .eq("id", message_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Message not found")

    return {"detail": "Message deleted", "id": message_id}


# ─── GET /api/inbox/stats ───────────────────────────────────────────────────

@router.get("/stats", response_model=InboxStats)
async def get_inbox_stats():
    """Get aggregate inbox statistics."""
    # Fetch all messages (just the fields we need for counting)
    response = (
        supabase.table("messages")
        .select("read, starred, status")
        .execute()
    )

    messages = response.data or []
    total = len(messages)

    stats = InboxStats(
        total=total,
        unread=sum(1 for m in messages if not m["read"]),
        starred=sum(1 for m in messages if m["starred"]),
        new=sum(1 for m in messages if m["status"] == "new"),
        replied=sum(1 for m in messages if m["status"] == "replied"),
        accepted=sum(1 for m in messages if m["status"] == "accepted"),
        declined=sum(1 for m in messages if m["status"] == "declined"),
    )

    return stats
