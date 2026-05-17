-- GreenPlus Ai — Chat System
-- Adds chat_rooms + messages tables with RLS and Realtime publication.
-- Idempotent: CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
-- policy creation wrapped in DO $$ EXCEPTION blocks.

-- ── chat_rooms: one room per user-shop pair ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  shop_id    UUID        NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, shop_id)
);

-- ── messages ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID        NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id  UUID        NOT NULL REFERENCES auth.users(id)        ON DELETE CASCADE,
  body       TEXT,
  type       TEXT        DEFAULT 'text' CHECK (type IN ('text', 'offer', 'system')),
  offer      JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS messages_room_created   ON public.messages  (room_id, created_at);
CREATE INDEX IF NOT EXISTS chat_rooms_user_idx     ON public.chat_rooms (user_id);
CREATE INDEX IF NOT EXISTS chat_rooms_shop_idx     ON public.chat_rooms (shop_id);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages   ENABLE ROW LEVEL SECURITY;

-- chat_rooms: the user who created the room OR the shop owner can see it.
DO $$ BEGIN
  CREATE POLICY "chat_rooms_participant_select" ON public.chat_rooms
    FOR SELECT USING (
      (SELECT auth.uid()) = user_id
      OR (SELECT auth.uid()) IN (
        SELECT owner_id FROM public.shops WHERE id = shop_id
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- chat_rooms: only the user side creates rooms.
DO $$ BEGIN
  CREATE POLICY "chat_rooms_user_insert" ON public.chat_rooms
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- messages: room participants (user or shop owner) can read messages.
DO $$ BEGIN
  CREATE POLICY "messages_participant_select" ON public.messages
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.chat_rooms cr
         WHERE cr.id = room_id
           AND (
             cr.user_id = (SELECT auth.uid())
             OR (SELECT auth.uid()) IN (
               SELECT owner_id FROM public.shops WHERE id = cr.shop_id
             )
           )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- messages: only the sender can insert their own messages.
DO $$ BEGIN
  CREATE POLICY "messages_sender_insert" ON public.messages
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Realtime publication ──────────────────────────────────────────────────────
-- NOTE: ALTER PUBLICATION requires superuser/replication privileges.
-- On hosted Supabase projects this works via the SQL editor (service-role context).
-- If it fails with "permission denied", enable Realtime for these tables manually
-- in the Supabase Dashboard → Database → Replication → supabase_realtime publication.

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
