-- Production was hardened externally. Keep source-controlled migration history aligned.
REVOKE ALL ON FUNCTION public.prepare_user_sync_record() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prepare_user_sync_record() FROM anon;
REVOKE ALL ON FUNCTION public.prepare_user_sync_record() FROM authenticated;
