-- ==============================================================================
-- TÚ TRINH LANGUAGE — Multi-Device Cloud Sync Migration (Supabase Postgres)
-- ==============================================================================
-- Schema Version: 20260819000000
-- Purpose: Provides durable, row-isolated multi-device cloud synchronization
-- for settings, vocabulary, readings, activities, and quiz history.
-- ==============================================================================

-- 1. Create table for synchronized data records
CREATE TABLE IF NOT EXISTS public.user_sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store TEXT NOT NULL,
    record_id TEXT NOT NULL,
    payload JSONB,
    revision BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_user_sync_records UNIQUE (user_id, store, record_id)
);

-- 2. Create table for per-user sync state / cursor tracking
CREATE TABLE IF NOT EXISTS public.user_sync_state (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_cursor TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    client_info JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create high-performance query indexes
CREATE INDEX IF NOT EXISTS idx_user_sync_records_user_id 
    ON public.user_sync_records (user_id);

CREATE INDEX IF NOT EXISTS idx_user_sync_records_updated_at 
    ON public.user_sync_records (updated_at);

CREATE INDEX IF NOT EXISTS idx_user_sync_records_user_store 
    ON public.user_sync_records (user_id, store);

CREATE INDEX IF NOT EXISTS idx_user_sync_records_user_updated 
    ON public.user_sync_records (user_id, updated_at);

-- 4. Enable Row Level Security (RLS) — MANDATORY
ALTER TABLE public.user_sync_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sync_state ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies for user_sync_records (Only authenticated owner can access)
CREATE POLICY "Users can select own sync records"
    ON public.user_sync_records
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync records"
    ON public.user_sync_records
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync records"
    ON public.user_sync_records
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync records"
    ON public.user_sync_records
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Strict RLS Policies for user_sync_state
CREATE POLICY "Users can select own sync state"
    ON public.user_sync_state
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync state"
    ON public.user_sync_state
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync state"
    ON public.user_sync_state
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync state"
    ON public.user_sync_state
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Comments for documentation & audit
COMMENT ON TABLE public.user_sync_records IS 'Stores local-first synced records across user devices with tombstone support.';
COMMENT ON TABLE public.user_sync_state IS 'Stores user sync metadata and cursor positions for incremental synchronization.';
