'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { archiveService, ArchivedFile, AuditLog } from '@/app/services/archive-service'
import { Archive, RotateCcw, Trash2, FileText, Calendar, User, Search } from 'lucide-react'

export function ArchiveManagement() {
  const [archivedFiles, setArchivedFiles] = useState<ArchivedFile[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'name' | 'uploader' | 'transaction' | 'date'>('name')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [successMessage, setSuccessMessage] = useState('')

  const handleSearchArchive = async () => {
    if (!searchQuery && searchType !== 'date') {
      alert('Please enter a search query')
      return
    }

    let results: ArchivedFile[] = []

    switch (searchType) {
      case 'name':
        results = await archiveService.searchArchivedByName(searchQuery)
        break
      case 'uploader':
        results = await archiveService.searchArchivedByUploader(searchQuery)
        break
      case 'transaction':
        const file = await archiveService.searchArchivedByTransactionId(searchQuery)
        results = file ? [file] : []
        break
      case 'date':
        if (dateRange.start && dateRange.end) {
          results = await archiveService.searchArchivedByDateRange(dateRange.start, dateRange.end)
        }
        break
    }

    setArchivedFiles(results)
  }

  const handleLoadAllArchives = async () => {
    const files = await archiveService.getAllArchivedFiles()
    setArchivedFiles(files)
  }

  const handleRestoreFile = async (archiveId: string) => {
    if (confirm('Restore this file from archive?')) {
      const success = await archiveService.restoreFile(archiveId, 'admin')
      if (success) {
        setArchivedFiles(archivedFiles.filter((f) => f.id !== archiveId))
        setSuccessMessage('File restored successfully')
        setTimeout(() => setSuccessMessage(''), 2000)
      }
    }
  }

  const handlePermanentlyDelete = async (archiveId: string) => {
    if (confirm('Permanently delete this file? This action cannot be undone.')) {
      const success = await archiveService.permanentlyDeleteFile(archiveId, 'admin')
      if (success) {
        setArchivedFiles(archivedFiles.filter((f) => f.id !== archiveId))
        setSuccessMessage('File permanently deleted')
        setTimeout(() => setSuccessMessage(''), 2000)
      }
    }
  }

  const handleBulkRestore = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to restore')
      return
    }

    if (confirm(`Restore ${selectedFiles.length} files?`)) {
      const restored = await archiveService.bulkRestoreFiles(selectedFiles, 'admin')
      setArchivedFiles(archivedFiles.filter((f) => !selectedFiles.includes(f.id)))
      setSelectedFiles([])
      setSuccessMessage(`${restored} files restored`)
      setTimeout(() => setSuccessMessage(''), 2000)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to delete')
      return
    }

    if (confirm(`Permanently delete ${selectedFiles.length} files? This cannot be undone.`)) {
      const deleted = await archiveService.bulkPermanentlyDelete(selectedFiles, 'admin')
      setArchivedFiles(archivedFiles.filter((f) => !selectedFiles.includes(f.id)))
      setSelectedFiles([])
      setSuccessMessage(`${deleted} files permanently deleted`)
      setTimeout(() => setSuccessMessage(''), 2000)
    }
  }

  const handleLoadAuditLogs = async () => {
    const logs = await archiveService.getAllAuditLogs()
    setAuditLogs(logs)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'archive':
        return 'bg-red-100 text-red-800'
      case 'restore':
        return 'bg-green-100 text-green-800'
      case 'delete':
        return 'bg-orange-100 text-orange-800'
      case 'download':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Archive className="w-8 h-8" /> Archive Management
        </h1>
        <p className="text-muted-foreground">Manage soft-deleted files and audit logs</p>
      </div>

      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="archives" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="archives">Archived Files</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Archived Files Tab */}
        <TabsContent value="archives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Archived Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="border rounded-md p-2 text-sm"
                  >
                    <option value="name">By File Name</option>
                    <option value="uploader">By Uploader</option>
                    <option value="transaction">By Transaction ID</option>
                    <option value="date">By Date Range</option>
                  </select>
                </div>

                {searchType === 'date' ? (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      placeholder="Start date"
                    />
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      placeholder="End date"
                    />
                    <Button onClick={handleSearchArchive} className="bg-blue-600">
                      <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter search term..."
                    />
                    <Button onClick={handleSearchArchive} className="bg-blue-600">
                      <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                  </div>
                )}

                <Button onClick={handleLoadAllArchives} variant="outline">
                  Load All Archived Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedFiles.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6 flex gap-2">
                <p className="text-sm text-blue-800">
                  {selectedFiles.length} file(s) selected
                </p>
                <Button
                  onClick={handleBulkRestore}
                  size="sm"
                  className="bg-green-600"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Restore Selected
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {archivedFiles.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Archive className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No archived files found</p>
                </CardContent>
              </Card>
            ) : (
              archivedFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {file.file_name}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Deleted: {new Date(file.deletion_date).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Deleted by: {file.deleted_by}
                          </p>
                          <p>Transaction ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{file.transaction_id}</code></p>
                          <p>Original Uploader: {file.original_uploader}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles([...selectedFiles, file.id])
                            } else {
                              setSelectedFiles(selectedFiles.filter((id) => id !== file.id))
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <Button
                          onClick={() => handleRestoreFile(file.id)}
                          size="sm"
                          className="bg-green-600"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" /> Restore
                        </Button>
                        <Button
                          onClick={() => handlePermanentlyDelete(file.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Button onClick={handleLoadAuditLogs} className="bg-blue-600">
            Load Audit Logs
          </Button>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No audit logs found</p>
                </CardContent>
              </Card>
            ) : (
              auditLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.toUpperCase()}
                          </Badge>
                          <p className="font-semibold">{log.file_name}</p>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Performed by: <strong>{log.performed_by}</strong></p>
                          <p>Date: {new Date(log.performed_date).toLocaleString()}</p>
                          {log.details && <p>Details: {log.details}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
