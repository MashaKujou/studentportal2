"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/contexts/auth-context"
import { teacherService } from "@/app/services/teacher-service"
import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"

export const TeacherMaterials = () => {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [title, setTitle] = useState("")
  const [type, setType] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const classes = useMemo(() => {
    if (!user) return []
    return teacherService.getClasses(user.id)
  }, [user])

  const materials = useMemo(() => {
    if (!selectedClass) return []
    return teacherService.getMaterials(selectedClass)
  }, [selectedClass])

  const handleUploadMaterial = async () => {
    if (!selectedClass || !title || !type) return

    setIsUploading(true)
    try {
      teacherService.uploadMaterial({
        teacherId: user!.id,
        classId: selectedClass,
        title,
        url: `material_${Date.now()}`,
        type,
      })
      setTitle("")
      setType("")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground">Upload and manage study materials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Materials</CardTitle>
          <CardDescription>Share study materials with students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="class" className="block text-sm font-medium mb-2">
              Select Class
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <>
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Material Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 5 - Equations"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2">
                  Material Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select type</option>
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="solution">Solution</option>
                </select>
              </div>

              <Button 
                onClick={handleUploadMaterial} 
                disabled={isUploading || !title || !type} 
                className="w-full h-10 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Material"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Materials</CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No materials uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted"
                  >
                    <div>
                      <p className="font-semibold">{mat.title}</p>
                      <p className="text-sm text-muted-foreground">{mat.type}</p>
                    </div>
                    <Button className="h-8 px-3 text-xs font-medium bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
