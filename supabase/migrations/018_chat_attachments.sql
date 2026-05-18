-- GreenPlus Ai — Chat Attachments
-- Extends messages table to support file and voice message types.
-- Idempotent: ADD COLUMN IF NOT EXISTS, constraint drop/re-add wrapped in DO $$.

-- ── Add attachment columns ────────────────────────────────────────────────────

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_url  TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size INTEGER;  -- bytes, for display

-- ── Extend type CHECK constraint to include 'file' and 'voice' ───────────────

DO $$ BEGIN
  ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_type_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_type_check
    CHECK (type IN ('text', 'offer', 'system', 'file', 'voice'));

-- ── Storage bucket for chat attachments ──────────────────────────────────────
-- Create a public bucket so authenticated users can upload files.
-- If the bucket already exists, this is a no-op.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,
  10485760,  -- 10 MB per file
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg',
    'application/pdf',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS: authenticated users can upload/read chat attachments ─────────

DO $$ BEGIN
  CREATE POLICY "chat_attachments_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'chat-attachments');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "chat_attachments_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'chat-attachments');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
