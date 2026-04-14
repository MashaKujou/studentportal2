"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { adminService } from "@/app/services/admin-service"
import { userStorage, subjectStorage } from "@/lib/storage"
import { useState, useMemo } from "react"
import { Book, Plus, Trash2, Edit2, Search } from "lucide-react"
import { ACADEMIC_LEVELS, SENIOR_HIGH_GRADES, DIPLOMA_YEARS, BACHELOR_YEARS, SENIOR_HIGH_STRANDS } from "@/lib/constants"
import { collegeCoursesStorage } from "@/lib/storage"

export const SubjectManagement = () => {
  // Subject Creation & Display
  const [subjects, setSubjects] = useState<any[]>(subjectStorage.getAll())
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newDay, setNewDay] = useState("")
  const [newUnit, setNewUnit] = useState("")

  // Class Assignment Wizard
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [selectedSubjectForAssign, setSelectedSubjectForAssign] = useState<any>(null)
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [assignSemester, setAssignSemester] = useState("1")
  const [assignYear, setAssignYear] = useState("1")

  const teachers = useMemo(() => userStorage.getTeachers(), [])

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) =>
      s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [subjects, searchTerm])

  const getAcademicColor = (subject: any) => {
    if (subject.unit === "Diploma") return "bg-blue-50 border-blue-200 dark:bg-blue-950/30"
    if (subject.unit === "Bachelor") return "bg-purple-50 border-purple-200 dark:bg-purple-950/30"
    return "bg-green-50 border-green-200 dark:bg-green-950/30"
  }

  const getAccentColor = (subject: any) => {
    if (subject.unit === "Diploma") return "bg-blue-500"
    if (subject.unit === "Bachelor") return "bg-purple-500"
    return "bg-green-500"
  }

  const handleCreateSubject = () => {
    if (newCode && newName && newTime && newDay && newUnit) {
      adminService.createSubject(newCode, newName, newTime, newDay, newUnit)
      setSubjects(subjectStorage.getAll())
      setNewCode("")
      setNewName("")
      setNewTime("")
      setNewDay("")
      setNewUnit("")
      setIsCreateModalOpen(false)
    }
  }

  const handleDeleteSubject = (id: string) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      adminService.deleteSubject(id)
      setSubjects(subjectStorage.getAll())
    }
  }

  const handleOpenAssignWizard = (subject: any) => {
    setSelectedSubjectForAssign(subject)
    setWizardStep(1)
    setIsAssignModalOpen(true)
  }

  const handleAssignClass = () => {
    if (selectedSubjectForAssign && selectedTeacher) {
      adminService.addClass(selectedSubjectForAssign.code, selectedTeacher, assignSemester, assignYear)
      setIsAssignModalOpen(false)
      setWizardStep(1)
      setSelectedSubjectForAssign(null)
      setSelectedTeacher("")
      setAssignSemester("1")
      setAssignYear("1")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Subject Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Create and assign subjects to classes</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Subject
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search subjects by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <Card 
              key={subject.id} 
              className={`border-2 ${getAcademicColor(subject)} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-default overflow-hidden`}
            >
              <div className={`h-1 ${getAccentColor(subject)}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`${getAccentColor(subject)} p-2.5 rounded-lg text-white shadow-md`}>
                      <Book className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold break-words">{subject.code}</CardTitle>
                      <CardDescription className="text-xs mt-1.5 line-clamp-2">{subject.name}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Time:</span>
                    <span className="font-semibold text-foreground">{subject.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Day:</span>
                    <span className="font-semibold text-foreground">{subject.day}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Level:</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${getAccentColor(subject)}`}>
                      {subject.unit}
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5 h-9"
                    onClick={() => handleOpenAssignWizard(subject)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Assign
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1.5 h-9"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-dashed border-2 bg-secondary/30">
            <CardContent className="py-16 text-center">
              <Book className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No subjects found</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first subject to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Subject Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground">Subject Code *</label>
              <Input
                placeholder="e.g., CS101"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="mt-2 h-10"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Subject Name *</label>
              <Input
                placeholder="e.g., Introduction to Computer Science"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-2 h-10"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Time *</label>
              <Input
                placeholder="e.g., 9:00 AM - 10:30 AM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mt-2 h-10"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Day *</label>
              <Input
                placeholder="e.g., Monday, Wednesday"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="mt-2 h-10"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Academic Level *</label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background font-medium mt-2"
              >
                <option value="">Select level...</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Senior High">Senior High</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-10">
                Cancel
              </Button>
              <Button onClick={handleCreateSubject} className="flex-1 h-10">
                Create Subject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Class Assignment Wizard Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {wizardStep === 1 && "🎯 Subject Selected"}
              {wizardStep === 2 && "👨‍🏫 Assign Teacher"}
              {wizardStep === 3 && "📅 Set Schedule"}
              {wizardStep === 4 && "✓ Review Assignment"}
            </DialogTitle>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition-all ${
                  step <= wizardStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="bg-secondary/40 p-4 rounded-lg space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Selected Subject</p>
                <p className="text-lg font-bold text-foreground">{selectedSubjectForAssign?.code}</p>
                <p className="text-sm text-foreground">{selectedSubjectForAssign?.name}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAssignModalOpen(false)} 
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button onClick={() => setWizardStep(2)} className="flex-1 h-10">
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Select Teacher *</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background font-medium mt-2"
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setWizardStep(1)} 
                  className="flex-1 h-10"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={() => setWizardStep(3)} 
                  disabled={!selectedTeacher} 
                  className="flex-1 h-10"
                >
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Semester *</label>
                <select
                  value={assignSemester}
                  onChange={(e) => setAssignSemester(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background font-medium mt-2"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Year *</label>
                <Input
                  type="number"
                  placeholder="e.g., 1"
                  value={assignYear}
                  onChange={(e) => setAssignYear(e.target.value)}
                  className="mt-2 h-10"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setWizardStep(2)} 
                  className="flex-1 h-10"
                >
                  ← Back
                </Button>
                <Button onClick={() => setWizardStep(4)} className="flex-1 h-10">
                  Review →
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <div className="bg-primary/10 border-2 border-primary/30 p-5 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Subject</p>
                  <p className="font-bold text-foreground">{selectedSubjectForAssign?.code}</p>
                  <p className="text-sm text-foreground/80">{selectedSubjectForAssign?.name}</p>
                </div>
                <div className="border-t border-primary/20 pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Teacher</p>
                  <p className="font-bold text-foreground">
                    {teachers.find((t) => t.id === selectedTeacher)?.firstName}{" "}
                    {teachers.find((t) => t.id === selectedTeacher)?.lastName}
                  </p>
                </div>
                <div className="border-t border-primary/20 pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Schedule</p>
                  <p className="font-bold text-foreground">Semester {assignSemester} • Year {assignYear}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setWizardStep(3)} 
                  className="flex-1 h-10"
                >
                  ← Back
                </Button>
                <Button 
                  onClick={handleAssignClass} 
                  className="flex-1 h-10 bg-green-600 hover:bg-green-700"
                >
                  ✓ Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
