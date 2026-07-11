-- Migration: Add date_key column and create atomic sync RPC
-- Run this in your Supabase SQL editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Add date_key column to tasks (for non-lossy week-boundary task storage)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS date_key TEXT;

-- 2. Backfill date_key for existing rows (maps day_index to the current week's dates)
UPDATE tasks
SET date_key = to_char(
  date_trunc('week', CURRENT_DATE)::date + day_index,
  'YYYY-MM-DD'
)
WHERE date_key IS NULL;

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_date_key ON tasks (date_key);

-- 4. Atomic sync function for tasks + overdue
--    All DB operations happen in a single transaction, preventing race conditions
--    between delete and insert phases that could cause duplicate primary keys.
CREATE OR REPLACE FUNCTION sync_tasks_overdue(
  p_user_id UUID,
  p_tasks_upsert JSONB,
  p_tasks_delete INT[],
  p_overdue_upsert JSONB,
  p_overdue_delete INT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Phase 1: deletes (runs before upserts to free up constraints)
  DELETE FROM tasks WHERE user_id = p_user_id AND id = ANY(p_tasks_delete);
  DELETE FROM overdue_tasks WHERE user_id = p_user_id AND id = ANY(p_overdue_delete);

  -- Phase 2: upserts
  IF jsonb_array_length(p_tasks_upsert) > 0 THEN
    INSERT INTO tasks (id, user_id, text, status, day_index, date_key)
    SELECT *
    FROM jsonb_to_recordset(p_tasks_upsert) AS x(
      id INT, user_id UUID, text TEXT, status TEXT, day_index INT, date_key TEXT
    )
    ON CONFLICT (id) DO UPDATE SET
      text        = EXCLUDED.text,
      status      = EXCLUDED.status,
      day_index   = EXCLUDED.day_index,
      date_key    = EXCLUDED.date_key;
  END IF;

  IF jsonb_array_length(p_overdue_upsert) > 0 THEN
    INSERT INTO overdue_tasks (id, user_id, text, from_day)
    SELECT *
    FROM jsonb_to_recordset(p_overdue_upsert) AS x(
      id INT, user_id UUID, text TEXT, from_day TEXT
    )
    ON CONFLICT (id) DO UPDATE SET
      text     = EXCLUDED.text,
      from_day = EXCLUDED.from_day;
  END IF;
END;
$$;
