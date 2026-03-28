'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { campusService, Facility, Department, FacilityBooking } from '@/app/services/campus-service'
import { useAuth } from '@/app/contexts/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Clock, Users, Phone, Mail, Building2 } from 'lucide-react'

export function StudentCampusResources() {
  const { user } = useAuth()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [bookings, setBookings] = useState<FacilityBooking[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadCampusData()
  }, [user])

  const loadCampusData = () => {
    setFacilities(campusService.getAllFacilities())
    setDepartments(campusService.getAllDepartments())
    if (user) {
      setBookings(campusService.getStudentBookings(user.id))
    }
  }

  const handleBookingSubmit = () => {
    if (!user || !selectedFacility || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.purpose) {
      alert('Please fill in all booking details')
      return
    }

    campusService.createBooking({
      facilityId: selectedFacility.id,
      studentId: user.id,
      bookingDate: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      purpose: bookingForm.purpose,
      status: 'pending',
    })

    setSuccessMessage('Booking request submitted! Waiting for admin approval.')
    loadCampusData()
    setSelectedFacility(null)
    setBookingForm({ date: '', startTime: '', endTime: '', purpose: '' })
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const filteredFacilities = filterType === 'all' ? facilities : facilities.filter((f) => f.type === filterType)

  return (
    <Tabs defaultValue="facilities" className="space-y-4">
      <TabsList>
        <TabsTrigger value="facilities">Facilities</TabsTrigger>
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="bookings">My Bookings</TabsTrigger>
      </TabsList>

      <TabsContent value="facilities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Campus Facilities</CardTitle>
            <CardDescription>Browse available campus facilities and amenities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                All
              </Button>
              {['lab', 'classroom', 'library', 'cafeteria', 'gymnasium', 'auditorium'].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => setFilterType(type)}
                  size="sm"
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>

            {filteredFacilities.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 text-center py-12">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No facilities found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredFacilities.map((facility) => (
                  <Card
                    key={facility.id}
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      selectedFacility?.id === facility.id ? 'border-blue-500 bg-blue-50/30' : ''
                    }`}
                    onClick={() => setSelectedFacility(selectedFacility?.id === facility.id ? null : facility)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold">{facility.name}</h3>
                            <Badge className={getAvailabilityColor(facility.availability)} variant="secondary">
                              {facility.availability}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {facility.type}
                            </Badge>
                          </div>

                          {facility.description && (
                            <p className="text-sm text-muted-foreground mb-2">{facility.description}</p>
                          )}

                          <div className="text-xs text-muted-foreground space-y-1">
                            <p className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {facility.location}
                            </p>
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {facility.operatingHours}
                            </p>
                            {facility.capacity && (
                              <p className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Capacity: {facility.capacity}
                              </p>
                            )}
                            {facility.contact && (
                              <p className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {facility.contact}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedFacility?.id === facility.id && facility.availability === 'available' && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <h4 className="font-semibold text-sm">Request Booking</h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Date</label>
                              <Input
                                type="date"
                                value={bookingForm.date}
                                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                className="text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium">Start Time</label>
                              <Input
                                type="time"
                                value={bookingForm.startTime}
                                onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                className="text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium">End Time</label>
                              <Input
                                type="time"
                                value={bookingForm.endTime}
                                onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                className="text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium">Purpose</label>
                              <Input
                                placeholder="e.g., Study group"
                                value={bookingForm.purpose}
                                onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <Button onClick={handleBookingSubmit} className="w-full" size="sm">
                            Submit Booking Request
                          </Button>
                        </div>
                      )}
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
            <CardTitle>Departments & Services</CardTitle>
            <CardDescription>Contact information for campus departments</CardDescription>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No departments available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <Card key={dept.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{dept.name}</h3>
                          {dept.description && (
                            <p className="text-sm text-muted-foreground mb-2">{dept.description}</p>
                          )}

                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              <span className="font-semibold">Head:</span> {dept.head}
                            </p>
                            <p className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {dept.email}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {dept.phone}
                            </p>
                            <p className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {dept.location}
                            </p>
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Office Hours: {dept.officeHours}
                            </p>
                          </div>
                        </div>
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
        <Card>
          <CardHeader>
            <CardTitle>My Facility Bookings</CardTitle>
            <CardDescription>Track your facility booking requests and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm mb-4">
                {successMessage}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">You have no facility bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const facility = campusService.getFacilityById(booking.facilityId)
                  return (
                    <Card key={booking.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{facility?.name}</h4>
                            <div className="text-xs text-muted-foreground space-y-1 mb-2">
                              <p>Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                              <p>
                                Time: {booking.startTime} - {booking.endTime}
                              </p>
                              <p>Purpose: {booking.purpose}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)} variant="secondary">
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
