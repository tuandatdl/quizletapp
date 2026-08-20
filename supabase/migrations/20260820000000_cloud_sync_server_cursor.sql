-- =============================================================================
-- TÚ TRINH LANGUAGE — Cloud Sync production hardening
-- =============================================================================
-- Adds a server-owned, strictly increasing cursor and prevents browser clocks
-- from ordering records. Apply after 20260819000000_cloud_sync.sql.

BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.user_sync_records_change_seq_seq AS BIGINT;

ALTER TABLE public.user_sync_records
  ADD COLUMN IF NOT EXISTS change_seq BIGINT;

ALTER SEQUENCE public.user_sync_records_change_seq_seq
  OWNED BY public.user_sync_records.change_seq;

ALTER TABLE public.user_sync_records
  ALTER COLUMN change_seq SET DEFAULT nextval('public.user_sync_records_change_seq_seq');

-- Existing rows need a cursor before it can be made mandatory. The order is
-- deterministic for this one-time backfill; all future order is trigger-owned.
UPDATE public.user_sync_records
SET change_seq = nextval('public.user_sync_records_change_seq_seq')
WHERE change_seq IS NULL;

ALTER TABLE public.user_sync_records
  ALTER COLUMN change_seq SET NOT NULL;

SELECT setval(
  'public.user_sync_records_change_seq_seq',
  COALESCE(MAX(change_seq), 1),
  COUNT(*) > 0
)
FROM public.user_sync_records;

CREATE OR REPLACE FUNCTION public.prepare_user_sync_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- RLS is evaluated for the caller's INSERT/UPDATE before this trigger. The
  -- trigger only owns server metadata, so a client cannot win conflicts by
  -- forging a device timestamp, revision, tombstone time, or cursor.
  NEW.updated_at := timezone('utc', now());
  NEW.change_seq := nextval('public.user_sync_records_change_seq_seq');

  IF TG_OP = 'INSERT' THEN
    NEW.revision := 1;
  ELSE
    NEW.revision := OLD.revision + 1;
  END IF;

  IF NEW.payload IS NULL THEN
    NEW.deleted_at := NEW.updated_at;
  ELSE
    NEW.deleted_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_sync_records_server_metadata ON public.user_sync_records;
CREATE TRIGGER user_sync_records_server_metadata
BEFORE INSERT OR UPDATE ON public.user_sync_records
FOR EACH ROW
EXECUTE FUNCTION public.prepare_user_sync_record();

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sync_records_change_seq
  ON public.user_sync_records (change_seq);

CREATE INDEX IF NOT EXISTS idx_user_sync_records_user_change_seq
  ON public.user_sync_records (user_id, change_seq);

COMMENT ON COLUMN public.user_sync_records.change_seq IS
  'Server-assigned monotonic sync cursor. Clients must pull in this order.';
COMMENT ON FUNCTION public.prepare_user_sync_record() IS
  'Owns sync write ordering, revision and tombstone timestamps; RLS remains enforced on table DML.';

COMMIT;
