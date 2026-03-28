'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { campusService, Facility, Department, FacilityBooking } from '@/app/services/campus-service'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { Student } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, CheckCircle2, XCircle, Building2 } from 'lucide-react'

type FacilityType = 'lab' | 'classroom' | 'library' | 'cafeteria' | 'gymnasium' | 'auditorium' | 'office' | 'other'

export function AdminCampusResourcesManagement() {
  const [facilities, setFacilities] = useState<Facility[]>(() => campusService.getAllFacilities())
  const [departments, setDepartments] = useState<Department[]>(() => campusService.getAllDepartments())
  const [bookings, setBookings] = useState<FacilityBooking[]>(() => campusService.getAllBookings())
  const [successMessage, setSuccessMessage] = useState('')

  // Facility form
  const [facName, setFacName] = useState('')
  const [facType, setFacType] = useState<FacilityType>('classroom')
  const [facDesc, setFacDesc] = useState('')
  const [facLocation, setFacLocation] = useState('')
  const [facCapacity, setFacCapacity] = useState('')
  const [facHours, setFacHours] = useState('08:00 AM - 05:00 PM')
  const [facAvailability, setFacAvailability] = useState<'available' | 'maintenance' | 'closed'>('available')

  // Department form
  const [deptName, setDeptName] = useState('')
  const [deptDesc, setDeptDesc] = useState('')
  const [deptHead, setDeptHead] = useState('')
  const [deptEmail, setDeptEmail] = useState('')
  const [deptPhone, setDeptPhone] = useState('')
  const [deptLocation, setDeptLocation] = useState('')
  const [deptHours, setDeptHours] = useState('08:00 AM - 05:00 PM')

  const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []
  const stats = campusService.getCampusStats()

  const handleAddFacility = () => {
    if (!facName || !facLocation || !facHours) {
      alert('Please fill in required fields')
      return
    }

    campusService.addFacility({
      name: facName,
      type: facType,
      description: facDesc,
      location: facLocation,
      capacity: facCapacity ? parseInt(facCapacity) : undefined,
      operatingHours: facHours,
      availability: facAvailability,
    })

    setFacilities(campusService.getAllFacilities())
    setSuccessMessage('Facility added successfully')
    setFacName('')
    setFacDesc('')
    setFacLocation('')
    setFacCapacity('')
    setFacAvailability('available')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleDeleteFacility = (id: string) => {
    if (confirm('Delete this facility?')) {
      campusService.deleteFacility(id)
      setFacilities(campusService.getAllFacilities())
    }
  }

  const handleAddDepartment = () => {
    if (!deptName || !deptHead || !deptEmail || !deptPhone || !deptLocation) {
      alert('Please fill in all required fields')
      return
    }

    campusService.addDepartment({
      name: deptName,
      description: deptDesc,
      head: deptHead,
      email: deptEmail,
      phone: deptPhone,
      location: deptLocation,
      officeHours: deptHours,
    })

    setDepartments(campusService.getAllDepartments())
    setSuccessMessage('Department added successfully')
    setDeptName('')
    setDeptDesc('')
    setDeptHead('')
    setDeptEmail('')
    setDeptPhone('')
    setDeptLocation('')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleDeleteDepartment = (id: string) => {
    if (confirm('Delete this department?')) {
      campusService.deleteDepartment(id)
      setDepartments(campusService.getAllDepartments())
    }
  }

  const handleApproveBooking = (id: string) => {
    campusService.updateBookingStatus(id, 'approved')
    setBookings(campusService.getAllBookings())
    setSuccessMessage('Booking approved')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleRejectBooking = (id: string) => {
    campusService.updateBookingStatus(id, 'rejected')
    setBookings(campusService.getAllBookings())
    setSuccessMessage('Booking rejected')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const getStudent = (studentId: string) => students.find((s) => s.id === studentId)
  const getFacility = (facilityId: string) => facilities.find((f) => f.id === facilityId)

  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const approvedBookings = bookings.filter((b) => b.status === 'approved')

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="facilities">Manage Facilities</TabsTrigger>
        <TabsTrigger value="departments">Manage Departments</TabsTrigger>
        <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFacilities}</div>
              <p className="text-xs text-muted-foreground">{stats.availableFacilities} available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingBookings} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Facility Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.facilityTypes}</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="facilities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Facility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  placeholder="e.g., Computer Lab A"
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <select
                  value={facType}
                  onChange={(e) => setFacType(e.target.value as FacilityType)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="lab">Lab</option>
                  <option value="classroom">Classroom</option>
                  <option value="library">Library</option>
                  <option value="cafeteria">Cafeteria</option>
                  <option value="gymnasium">Gymnasium</option>
                  <option value="auditorium">Auditorium</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  placeholder="e.g., Building A, 2nd Floor"
                  value={facLocation}
                  onChange={(e) => setFacLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={facCapacity}
                  onChange={(e) => setFacCapacity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hours *</label>
                <Input
                  placeholder="e.g., 08:00 AM - 05:00 PM"
                  value={facHours}
                  onChange={(e) => setFacHours(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <select
                  value={facAvailability}
                  onChange={(e) => setFacAvailability(e.target.value as 'available' | 'maintenance' | 'closed')}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Facility description and details"
                value={facDesc}
                onChange={(e) => setFacDesc(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleAddFacility} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
            <CardDescription>{facilities.length} facilities available</CardDescription>
          </CardHeader>
          <CardContent>
            {facilities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No facilities added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {facilities.map((fac) => (
                  <Card key={fac.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{fac.name}</h4>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {fac.type}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                fac.availability === 'available'
                                  ? 'bg-green-100 text-green-800'
                                  : fac.availability === 'maintenance'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {fac.availability}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{fac.location}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFacility(fac.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Department Name *</label>
              <Input
                placeholder="e.g., Student Services"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Head *</label>
                <Input
                  placeholder="Name"
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="email@institution.edu"
                  value={deptEmail}
                  onChange={(e) => setDeptEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  placeholder="Contact number"
                  value={deptPhone}
                  onChange={(e) => setDeptPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <Input
                  placeholder="e.g., Building B, 1st Floor"
                  value={deptLocation}
                  onChange={(e) => setDeptLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Office Hours</label>
              <Input
                placeholder="e.g., 08:00 AM - 05:00 PM"
                value={deptHours}
                onChange={(e) => setDeptHours(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Department description and services"
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleAddDepartment} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>{departments.length} departments</CardDescription>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No departments added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {departments.map((dept) => (
                  <Card key={dept.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{dept.name}</h4>
                          <p className="text-xs text-muted-foreground mb-1">Head: {dept.head}</p>
                          <p className="text-xs text-muted-foreground">{dept.email} | {dept.phone}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDepartment(dept.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bookings" className="space-y-4">
        {pendingBookings.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50/30">
            <CardHeader>
              <CardTitle>Pending Booking Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingBookings.map((booking) => {
                const facility = getFacility(booking.facilityId)
                const student = getStudent(booking.studentId)
                return (
                  <Card key={booking.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{facility?.name}</h4>
                          <p className="text-xs text-muted-foreground mb-1">
                            Student: {student?.firstName} {student?.lastName}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                            <p>
                              Time: {booking.startTime} - {booking.endTime}
                            </p>
                            <p>Purpose: {booking.purpose}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveBooking(booking.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectBooking(booking.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>{bookings.length} total bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No booking requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map((booking) => {
                  const facility = getFacility(booking.facilityId)
                  const student = getStudent(booking.studentId)
                  return (
                    <Card key={booking.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{facility?.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {student?.firstName} {student?.lastName} • {new Date(booking.bookingDate).toLocaleDateString()} •{' '}
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs ${
                              booking.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
