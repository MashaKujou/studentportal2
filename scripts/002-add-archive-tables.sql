-- Create archived_files table for soft deletes
CREATE TABLE IF NOT EXISTS archived_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_path TEXT,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  original_uploader VARCHAR(255),
  deleted_by VARCHAR(255) NOT NULL,
  deletion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  retention_metadata TEXT,
  original_created_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table (insert-only, tamper-proof via RLS)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(50) NOT NULL, -- 'archive', 'restore', 'delete', 'download'
  file_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  performed_by VARCHAR(255) NOT NULL,
  performed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_archived_files_file_name ON archived_files USING GIN(file_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_archived_files_deletion_date ON archived_files(deletion_date DESC);
CREATE INDEX IF NOT EXISTS idx_archived_files_transaction_id ON archived_files(transaction_id);
CREATE INDEX IF NOT EXISTS idx_archived_files_uploader ON archived_files(original_uploader);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_file_id ON audit_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_date ON audit_logs(performed_date DESC);

-- Enable trigram index for text search on archived_files (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- RLS Policies for archived_files
ALTER TABLE archived_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all archived files"
  ON archived_files FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin can archive files"
  ON archived_files FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admin can restore files"
  ON archived_files FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for audit_logs (insert-only, never update)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Anyone can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Prevent updates and deletes on audit logs (audit trail integrity)
CREATE POLICY "Prevent audit log updates"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Prevent audit log deletes"
  ON audit_logs FOR DELETE
  USING (false);

-- Add comment for documentation
COMMENT ON TABLE archived_files IS 'Soft-deleted files with archival metadata and retention tracking';
COMMENT ON TABLE audit_logs IS 'Tamper-proof audit trail for all file operations. Insert-only via RLS.';
COMMENT ON COLUMN archived_files.transaction_id IS 'Unique transaction ID for grouping related archive operations';
COMMENT ON COLUMN archived_files.retention_metadata IS 'Metadata about retention policy (e.g., "archived 2025-03-28")';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: archive, restore, delete, or download';
