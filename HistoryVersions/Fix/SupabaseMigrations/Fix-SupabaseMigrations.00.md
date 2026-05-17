# Fix-SupabaseMigrations.00 — Idempotent ALTER PUBLICATION Guards

18 May 2026 (18 พฤษภาคม 2569)

## Overview

แก้ไข migration files 014 และ 016 ที่ fail ด้วย `SQLSTATE 42710` เมื่อ table ถูก add เข้า `supabase_realtime` publication แล้ว (เช่นหลัง reset หรือ re-run migration)

## Reason

```
ERROR: relation "messages" is already member of publication "supabase_realtime" (SQLSTATE 42710)
```

`ALTER PUBLICATION supabase_realtime ADD TABLE` ไม่มี `IF NOT EXISTS` syntax — ต้องใช้ `DO $$ BEGIN ... IF NOT EXISTS ... END $$` แทน

ตารางที่ affected (Realtime enabled อยู่แล้วบน hosted Supabase):
- `messages` — enabled
- `chat_rooms` — enabled  
- `user_profiles` — enabled

## Changes

### supabase/migrations/014_chat.sql

ห่อ 2 statements ด้วย DO block:
```sql
-- before:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- after: (each wrapped)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
```

### supabase/migrations/016_rider_realtime_rls.sql

ห่อ 1 statement ด้วย DO block (user_profiles)

## Validation

- Migration สามารถ re-run ได้โดยไม่ error (idempotent)
- ถ้า table ยังไม่ถูก add จะ add เหมือนเดิม
- ถ้า add ไปแล้วจะ skip โดยไม่ error

## Notes

- PostgreSQL ไม่มี `ALTER PUBLICATION ... ADD TABLE IF NOT EXISTS` syntax
- `pg_publication_tables` คือ system catalog view ที่ list tables ใน each publication
