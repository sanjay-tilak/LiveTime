-- ============================================================================
-- LiveTime Inbox — Database Schema
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard → Your Project → SQL Editor → New Query
-- ============================================================================

-- ─── Messages Table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender          TEXT NOT NULL,
    sender_role     TEXT NOT NULL DEFAULT '',
    sender_initials TEXT NOT NULL DEFAULT '',
    sender_color    TEXT NOT NULL DEFAULT 'bg-gray-500',
    subject         TEXT NOT NULL,
    preview         TEXT NOT NULL DEFAULT '',
    full_message    TEXT NOT NULL DEFAULT '',
    timestamp       TEXT NOT NULL DEFAULT '',
    date            TEXT NOT NULL DEFAULT '',
    read            BOOLEAN NOT NULL DEFAULT FALSE,
    starred         BOOLEAN NOT NULL DEFAULT FALSE,
    status          TEXT NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'replied', 'accepted', 'declined')),
    partnership_type TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages (status);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages (read);
CREATE INDEX IF NOT EXISTS idx_messages_starred ON messages (starred);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);


-- ─── Thread Messages Table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS thread_messages (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id      UUID NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
    sender          TEXT NOT NULL,
    sender_initials TEXT NOT NULL DEFAULT '',
    sender_color    TEXT NOT NULL DEFAULT 'bg-gray-500',
    content         TEXT NOT NULL,
    timestamp       TEXT NOT NULL DEFAULT '',
    is_own          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching thread by parent message
CREATE INDEX IF NOT EXISTS idx_thread_messages_message_id ON thread_messages (message_id);
CREATE INDEX IF NOT EXISTS idx_thread_messages_created_at ON thread_messages (message_id, created_at);


-- ─── Row Level Security (RLS) ───────────────────────────────────────────────
-- For development, allow full access with the anon key.
-- In production, replace these with proper auth-based policies.

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (development only)
CREATE POLICY "Allow all access to messages" ON messages
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to thread_messages" ON thread_messages
    FOR ALL USING (true) WITH CHECK (true);
