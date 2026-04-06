-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for search performance on existing archived_files table
CREATE INDEX IF NOT EXISTS idx_archived_files_deletion_date ON public.archived_files(deletion_date DESC);
CREATE INDEX IF NOT EXISTS idx_archived_files_transaction_id ON public.archived_files(transaction_id);
CREATE INDEX IF NOT EXISTS idx_archived_files_archive_date ON public.archived_files(archive_date DESC);

-- Create indexes on existing audit_log table
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- Enable RLS on archived_files
ALTER TABLE public.archived_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for archived_files (admins only)
DROP POLICY IF EXISTS "Admin can view all archived files" ON public.archived_files;
CREATE POLICY "Admin can view all archived files"
  ON public.archived_files FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admin can archive files" ON public.archived_files;
CREATE POLICY "Admin can archive files"
  ON public.archived_files FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admin can restore files" ON public.archived_files;
CREATE POLICY "Admin can restore files"
  ON public.archived_files FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_log (insert-only, admin can view)
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_log;
CREATE POLICY "Admin can view audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_log;
CREATE POLICY "Anyone can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- Prevent updates on audit logs (tamper-proof)
DROP POLICY IF EXISTS "Prevent audit log updates" ON public.audit_log;
CREATE POLICY "Prevent audit log updates"
  ON public.audit_log FOR UPDATE
  USING (false);

-- Prevent deletes on audit logs (tamper-proof)
DROP POLICY IF EXISTS "Prevent audit log deletes" ON public.audit_log;
CREATE POLICY "Prevent audit log deletes"
  ON public.audit_log FOR DELETE
  USING (false);

-- Add comments for documentation
COMMENT ON TABLE public.archived_files IS 'Soft-deleted files with archival metadata and retention tracking';
COMMENT ON TABLE public.audit_log IS 'Tamper-proof audit trail for all operations. Insert-only via RLS.';
COMMENT ON COLUMN public.archived_files.transaction_id IS 'Unique transaction ID for grouping related archive operations';
COMMENT ON COLUMN public.archived_files.retention_metadata IS 'Metadata about retention policy (JSON) (e.g., "archived 2025-03-28")';
COMMENT ON COLUMN public.audit_log.action IS 'Type of action: archive, restore, delete, or download';
