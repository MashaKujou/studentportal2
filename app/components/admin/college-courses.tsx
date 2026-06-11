"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collegeCoursesStorage } from "@/lib/storage"

export const CollegeCourses = () => {
  const [diplomaCourses, setDiplomaCourses] = useState<string[]>([])
  const [bachelorCourses, setBachelorCourses] = useState<string[]>([])
  const [newDiplomaCourse, setNewDiplomaCourse] = useState("")
  const [newBachelorCourse, setNewBachelorCourse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const courses = collegeCoursesStorage.getAll()
    setDiplomaCourses(courses.diplomaCourses)
    setBachelorCourses(courses.bachelorCourses)
  }, [])

  const handleAddDiplomaCourse = () => {
    if (newDiplomaCourse.trim()) {
      if (diplomaCourses.includes(newDiplomaCourse.toUpperCase())) {
        alert("This course already exists")
        return
      }
      const updated = [...diplomaCourses, newDiplomaCourse.toUpperCase()]
      setDiplomaCourses(updated)
      collegeCoursesStorage.update(updated, bachelorCourses)
      setNewDiplomaCourse("")
    }
  }

  const handleRemoveDiplomaCourse = (course: string) => {
    const updated = diplomaCourses.filter((c) => c !== course)
    setDiplomaCourses(updated)
    collegeCoursesStorage.update(updated, bachelorCourses)
  }

  const handleAddBachelorCourse = () => {
    if (newBachelorCourse.trim()) {
      if (bachelorCourses.includes(newBachelorCourse.toUpperCase())) {
        alert("This course already exists")
        return
      }
      const updated = [...bachelorCourses, newBachelorCourse.toUpperCase()]
      setBachelorCourses(updated)
      collegeCoursesStorage.update(diplomaCourses, updated)
      setNewBachelorCourse("")
    }
  }

  const handleRemoveBachelorCourse = (course: string) => {
    const updated = bachelorCourses.filter((c) => c !== course)
    setBachelorCourses(updated)
    collegeCoursesStorage.update(diplomaCourses, updated)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diploma Courses (3 Years)</CardTitle>
          <CardDescription>Manage available diploma program courses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter course code (e.g., DIT)"
              value={newDiplomaCourse}
              onChange={(e) => setNewDiplomaCourse(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddDiplomaCourse()
              }}
            />
            <Button onClick={handleAddDiplomaCourse}>Add Course</Button>
          </div>

          <div className="space-y-2">
            {diplomaCourses.map((course) => (
              <div key={course} className="flex items-center justify-between p-3 border rounded-md bg-background">
                <span className="font-medium">{course}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveDiplomaCourse(course)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bachelor Courses (4 Years)</CardTitle>
          <CardDescription>Manage available bachelor program courses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter course code (e.g., BTVTED)"
              value={newBachelorCourse}
              onChange={(e) => setNewBachelorCourse(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddBachelorCourse()
              }}
            />
            <Button onClick={handleAddBachelorCourse}>Add Course</Button>
          </div>

          <div className="space-y-2">
            {bachelorCourses.map((course) => (
              <div key={course} className="flex items-center justify-between p-3 border rounded-md bg-background">
                <span className="font-medium">{course}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveBachelorCourse(course)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
