'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { userStorage } from '@/lib/storage'

export function ExportAccounts() {
  const exportToFile = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportAdmins = () => {
    const admins = userStorage.getAdmins()
    let content = '===========================================\n'
    content += 'ADMIN ACCOUNTS\n'
    content += '===========================================\n'
    content += `Last Updated: ${new Date().toLocaleString()}\n\n`
    
    admins.forEach((admin, index) => {
      content += `Account ${index + 1}:\n`
      content += '-----------\n'
      content += `Name: ${admin.firstName} ${admin.lastName}\n`
      content += `Email: ${admin.email}\n`
      content += `Password: ${admin.password}\n`
      content += `ID: ${admin.id}\n\n`
    })
    
    exportToFile(content, 'AdminAccounts.txt')
  }

  const exportTeachers = () => {
    const teachers = userStorage.getTeachers()
    let content = '===========================================\n'
    content += 'TEACHER ACCOUNTS\n'
    content += '===========================================\n'
    content += `Last Updated: ${new Date().toLocaleString()}\n\n`
    
    teachers.forEach((teacher, index) => {
      content += `Account ${index + 1}:\n`
      content += '-----------\n'
      content += `Name: ${teacher.firstName} ${teacher.lastName}\n`
      content += `Email: ${teacher.email}\n`
      content += `Password: ${teacher.password}\n`
      content += `ID: ${teacher.id}\n`
      content += `Department: ${teacher.department || 'N/A'}\n`
      content += `Subjects: ${teacher.subjects || 'N/A'}\n\n`
    })
    
    exportToFile(content, 'TeacherAccounts.txt')
  }

  const exportStudents = () => {
    const students = userStorage.getStudents()
    let content = '===========================================\n'
    content += 'STUDENT ACCOUNTS\n'
    content += '===========================================\n'
    content += `Last Updated: ${new Date().toLocaleString()}\n\n`
    
    students.forEach((student, index) => {
      content += `Account ${index + 1}:\n`
      content += '-----------\n'
      content += `Name: ${student.firstName} ${student.lastName}\n`
      content += `Email: ${student.email}\n`
      content += `Password: ${student.password}\n`
      content += `ID: ${student.id}\n`
      content += `Status: ${student.status}\n`
      content += `Academic Level: ${student.academicLevel}\n`
      content += `Year: ${student.year}\n`
      content += `Course/Strand: ${student.course || student.strand || 'N/A'}\n\n`
    })
    
    exportToFile(content, 'StudentAccounts.txt')
  }

  const exportAll = () => {
    exportAdmins()
    setTimeout(() => exportTeachers(), 100)
    setTimeout(() => exportStudents(), 200)
  }

  const updateAccountFiles = () => {
    // Note: Browser can't directly write to project files, but we'll export them for download
    // Admin can then replace the files in Accounts folder manually
    exportAll()
    alert('Account files have been exported! Please replace the files in the Accounts folder with the downloaded versions.')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Account Credentials
        </CardTitle>
        <CardDescription>
          Download current account data as text files for easy reference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={exportAdmins} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Admins
          </Button>
          <Button onClick={exportTeachers} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Teachers
          </Button>
          <Button onClick={exportStudents} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Students
          </Button>
          <Button onClick={exportAll} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
        <div className="pt-4 border-t">
          <Button onClick={updateAccountFiles} className="w-full" variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Update All Account Files (Download & Replace)
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will download all account files. Save them to the Accounts folder to keep files updated.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Note: Exported files will contain plain text passwords. Keep them secure.
        </p>
      </CardContent>
    </Card>
  )
}
