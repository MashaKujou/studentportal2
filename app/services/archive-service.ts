'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ArchivedFile {
  id: string
  file_name: string
  file_type: string
  file_path: string
  transaction_id: string
  original_uploader: string
  deleted_by: string
  deletion_date: string
  retention_metadata: string
  original_created_at: string
  created_at: string
}

export interface AuditLog {
  id: string
  action: 'archive' | 'restore' | 'delete' | 'download'
  file_id: string
  file_name: string
  performed_by: string
  performed_date: string
  details?: string
}

export const archiveService = {
  // Archive a file (soft delete)
  async archiveFile(
    fileId: string,
    fileName: string,
    fileType: string,
    filePath: string,
    uploaderId: string,
    deletedBy: string,
    transactionId: string
  ): Promise<ArchivedFile | null> {
    const { data, error } = await supabase
      .from('archived_files')
      .insert([
        {
          file_name: fileName,
          file_type: fileType,
          file_path: filePath,
          transaction_id: transactionId,
          original_uploader: uploaderId,
          deleted_by: deletedBy,
          deletion_date: new Date().toISOString(),
          retention_metadata: `archived ${new Date().toISOString().split('T')[0]}`,
          original_created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Error archiving file:', error)
      return null
    }

    // Log the archive action
    await archiveService.logAuditAction(
      'archive',
      fileId,
      fileName,
      deletedBy,
      `Archived by ${deletedBy}`
    )

    return data?.[0] || null
  },

  // Get all archived files
  async getAllArchivedFiles(): Promise<ArchivedFile[]> {
    const { data, error } = await supabase
      .from('archived_files')
      .select('*')
      .order('deletion_date', { ascending: false })

    if (error) {
      console.error('Error fetching archived files:', error)
      return []
    }
    return data || []
  },

  // Search archived files by name
  async searchArchivedByName(query: string): Promise<ArchivedFile[]> {
    const { data, error } = await supabase
      .from('archived_files')
      .select('*')
      .ilike('file_name', `%${query}%`)
      .order('deletion_date', { ascending: false })

    if (error) {
      console.error('Error searching archived files:', error)
      return []
    }
    return data || []
  },

  // Search archived files by date range
  async searchArchivedByDateRange(startDate: string, endDate: string): Promise<ArchivedFile[]> {
    const { data, error } = await supabase
      .from('archived_files')
      .select('*')
      .gte('deletion_date', startDate)
      .lte('deletion_date', endDate)
      .order('deletion_date', { ascending: false })

    if (error) {
      console.error('Error searching archived files by date:', error)
      return []
    }
    return data || []
  },

  // Search archived files by transaction ID
  async searchArchivedByTransactionId(transactionId: string): Promise<ArchivedFile | null> {
    const { data, error } = await supabase
      .from('archived_files')
      .select('*')
      .eq('transaction_id', transactionId)
      .single()

    if (error) {
      console.error('Error searching by transaction ID:', error)
      return null
    }
    return data
  },

  // Search archived files by uploader
  async searchArchivedByUploader(uploaderName: string): Promise<ArchivedFile[]> {
    const { data, error } = await supabase
      .from('archived_files')
      .select('*')
      .ilike('original_uploader', `%${uploaderName}%`)
      .order('deletion_date', { ascending: false })

    if (error) {
      console.error('Error searching by uploader:', error)
      return []
    }
    return data || []
  },

  // Filter archived files by type
  async filterByFileType(fileType: string): Promise<ArchivedFile[]> {
    const { data, error } = await supabase
      .from('archived_files')
      .select('*')
      .eq('file_type', fileType)
      .order('deletion_date', { ascending: false })

    if (error) {
      console.error('Error filtering by file type:', error)
      return []
    }
    return data || []
  },

  // Restore a file from archive
  async restoreFile(archiveId: string, restoredBy: string): Promise<boolean> {
    const { error: deleteError } = await supabase
      .from('archived_files')
      .delete()
      .eq('id', archiveId)

    if (deleteError) {
      console.error('Error restoring file:', deleteError)
      return false
    }

    // Log the restore action
    const archivedFile = await supabase
      .from('archived_files')
      .select('*')
      .eq('id', archiveId)
      .single()

    if (!archivedFile.error) {
      await archiveService.logAuditAction(
        'restore',
        archiveId,
        archivedFile.data.file_name,
        restoredBy,
        `Restored by ${restoredBy}`
      )
    }

    return true
  },

  // Permanently delete archived file
  async permanentlyDeleteFile(archiveId: string, deletedBy: string): Promise<boolean> {
    // Get file info before deleting
    const { data: archivedFile } = await supabase
      .from('archived_files')
      .select('*')
      .eq('id', archiveId)
      .single()

    const { error } = await supabase
      .from('archived_files')
      .delete()
      .eq('id', archiveId)

    if (error) {
      console.error('Error permanently deleting file:', error)
      return false
    }

    // Log the permanent delete action
    if (archivedFile) {
      await archiveService.logAuditAction(
        'delete',
        archiveId,
        archivedFile.file_name,
        deletedBy,
        `Permanently deleted by ${deletedBy}`
      )
    }

    return true
  },

  // Bulk restore files
  async bulkRestoreFiles(archiveIds: string[], restoredBy: string): Promise<number> {
    let restoredCount = 0

    for (const archiveId of archiveIds) {
      const success = await archiveService.restoreFile(archiveId, restoredBy)
      if (success) restoredCount++
    }

    return restoredCount
  },

  // Bulk permanently delete files
  async bulkPermanentlyDelete(archiveIds: string[], deletedBy: string): Promise<number> {
    let deletedCount = 0

    for (const archiveId of archiveIds) {
      const success = await archiveService.permanentlyDeleteFile(archiveId, deletedBy)
      if (success) deletedCount++
    }

    return deletedCount
  },

  // Audit log management
  async logAuditAction(
    action: 'archive' | 'restore' | 'delete' | 'download',
    fileId: string,
    fileName: string,
    performedBy: string,
    details?: string
  ): Promise<AuditLog | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([
        {
          action,
          file_id: fileId,
          file_name: fileName,
          performed_by: performedBy,
          performed_date: new Date().toISOString(),
          details: details || null,
        },
      ])
      .select()

    if (error) {
      console.error('Error logging audit action:', error)
      return null
    }
    return data?.[0] || null
  },

  // Get audit trail for a file
  async getAuditTrail(fileId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('performed_date', { ascending: false })

    if (error) {
      console.error('Error fetching audit trail:', error)
      return []
    }
    return data || []
  },

  // Get all audit logs
  async getAllAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('performed_date', { ascending: false })

    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
    return data || []
  },

  // Get audit logs by action type
  async getAuditLogsByAction(action: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .order('performed_date', { ascending: false })

    if (error) {
      console.error('Error fetching logs by action:', error)
      return []
    }
    return data || []
  },

  // Get audit logs for a specific user
  async getAuditLogsByUser(performedBy: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('performed_by', performedBy)
      .order('performed_date', { ascending: false })

    if (error) {
      console.error('Error fetching logs by user:', error)
      return []
    }
    return data || []
  },
}
