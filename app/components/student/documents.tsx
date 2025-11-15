"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/contexts/auth-context"
import { studentService } from "@/app/services/student-service"
import { useState, useEffect } from "react"
import { Download, Trash2, Upload } from 'lucide-react'

export const StudentDocuments = () => {
  const { user } = useAuth()

  const [documents, setDocuments] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("Transcript")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    const docs = studentService.getDocuments(user.id)
    setDocuments(docs)
  }, [user, refreshKey])

  const documentsByType = documents.reduce((acc: any, doc: any) => {
    if (!acc[doc.type]) {
      acc[doc.type] = []
    }
    acc[doc.type].push(doc)
    return acc
  }, {})

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !documentName) return

    setIsUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string
        studentService.uploadDocument({
          studentId: user!.id,
          name: documentName,
          url: fileUrl,
          type: documentType,
        })
        setDocumentName("")
        setDocumentType("Transcript")
        setRefreshKey(prev => prev + 1)
        e.target.value = ""
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = (docId: string) => {
    studentService.deleteDocument(docId, user!.id)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground">Upload and manage your documents</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document
          </CardTitle>
          <CardDescription>Upload important documents and forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="doc-name" className="block text-sm font-medium mb-2">
              Document Name
            </label>
            <Input
              id="doc-name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., My Transcript 2024"
            />
          </div>

          <div>
            <label htmlFor="doc-type" className="block text-sm font-medium mb-2">
              Document Type
            </label>
            <select
              id="doc-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="Transcript">Transcript</option>
              <option value="Certificate">Certificate</option>
              <option value="Transfer Certificate">Transfer Certificate</option>
              <option value="Leave Letter">Leave Letter</option>
              <option value="Identity Card Photo">Identity Card Photo</option>
              <option value="Admission Letter">Admission Letter</option>
            </select>
          </div>

          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
              Choose File
            </label>
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-lg hover:bg-muted">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Click to upload or drag and drop</span>
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleUploadDocument}
              disabled={isUploading || !documentName}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>Organized by document type</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No documents uploaded yet</p>
          ) : (
            <div className="space-y-6">
              {Object.keys(documentsByType).sort().map((type) => (
                <div key={type} className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-2">{type}</h3>
                  <div className="space-y-2">
                    {documentsByType[type].map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted"
                      >
                        <div>
                          <p className="font-semibold">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a href={doc.url} download={doc.name}>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
