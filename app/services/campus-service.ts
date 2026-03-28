import { STORAGE_KEYS } from "@/lib/constants"
import { storage } from "@/lib/storage"

export interface Facility {
  id: string
  name: string
  type: "lab" | "classroom" | "library" | "cafeteria" | "gymnasium" | "auditorium" | "office" | "other"
  description: string
  location: string
  capacity?: number
  operatingHours: string
  contact?: string
  availability: "available" | "maintenance" | "closed"
  image?: string
  createdAt: string
}

export interface Department {
  id: string
  name: string
  description: string
  head: string
  email: string
  phone: string
  location: string
  officeHours: string
  createdAt: string
}

export interface FacilityBooking {
  id: string
  facilityId: string
  studentId: string
  bookingDate: string
  startTime: string
  endTime: string
  purpose: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  createdAt: string
}

export const campusService = {
  // Facility management
  getAllFacilities: (): Facility[] => {
    return storage.get<Facility[]>(STORAGE_KEYS.CAMPUS_RESOURCES) || []
  },

  getFacilitiesByType: (type: string): Facility[] => {
    const facilities = campusService.getAllFacilities()
    return facilities.filter((f) => f.type === type)
  },

  getFacilityById: (id: string): Facility | null => {
    const facilities = campusService.getAllFacilities()
    return facilities.find((f) => f.id === id) || null
  },

  addFacility: (facility: Omit<Facility, "id" | "createdAt">): Facility => {
    const facilities = campusService.getAllFacilities()
    const newFacility: Facility = {
      ...facility,
      id: `fac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    facilities.push(newFacility)
    storage.set(STORAGE_KEYS.CAMPUS_RESOURCES, facilities)
    return newFacility
  },

  updateFacility: (id: string, updates: Partial<Facility>): Facility | null => {
    const facilities = campusService.getAllFacilities()
    const facility = facilities.find((f) => f.id === id)
    if (!facility) return null

    Object.assign(facility, updates)
    storage.set(STORAGE_KEYS.CAMPUS_RESOURCES, facilities)
    return facility
  },

  deleteFacility: (id: string): void => {
    const facilities = campusService.getAllFacilities()
    const filtered = facilities.filter((f) => f.id !== id)
    storage.set(STORAGE_KEYS.CAMPUS_RESOURCES, filtered)
  },

  // Department management
  getAllDepartments: (): Department[] => {
    const data = storage.get<{ facilities: Facility[]; departments: Department[] }>(STORAGE_KEYS.CAMPUS_RESOURCES)
    return data?.departments || []
  },

  getDepartmentById: (id: string): Department | null => {
    const departments = campusService.getAllDepartments()
    return departments.find((d) => d.id === id) || null
  },

  addDepartment: (department: Omit<Department, "id" | "createdAt">): Department => {
    const data = storage.get<{ facilities: Facility[]; departments: Department[] }>(STORAGE_KEYS.CAMPUS_RESOURCES) || {
      facilities: [],
      departments: [],
    }

    const newDepartment: Department = {
      ...department,
      id: `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    data.departments.push(newDepartment)
    storage.set(STORAGE_KEYS.CAMPUS_RESOURCES, data)
    return newDepartment
  },

  updateDepartment: (id: string, updates: Partial<Department>): Department | null => {
    const data = storage.get<{ facilities: Facility[]; departments: Department[] }>(STORAGE_KEYS.CAMPUS_RESOURCES) || {
      facilities: [],
      departments: [],
    }
    const department = data.departments.find((d) => d.id === id)
    if (!department) return null

    Object.assign(department, updates)
    storage.set(STORAGE_KEYS.CAMPUS_RESOURCES, data)
    return department
  },

  deleteDepartment: (id: string): void => {
    const data = storage.get<{ facilities: Facility[]; departments: Department[] }>(STORAGE_KEYS.CAMPUS_RESOURCES) || {
      facilities: [],
      departments: [],
    }
    data.departments = data.departments.filter((d) => d.id !== id)
    storage.set(STORAGE_KEYS.CAMPUS_RESOURCES, data)
  },

  // Facility booking
  getStudentBookings: (studentId: string): FacilityBooking[] => {
    const bookings = storage.get<FacilityBooking[]>("campus_bookings") || []
    return bookings.filter((b) => b.studentId === studentId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getAllBookings: (): FacilityBooking[] => {
    return storage.get<FacilityBooking[]>("campus_bookings") || []
  },

  createBooking: (booking: Omit<FacilityBooking, "id" | "createdAt">): FacilityBooking => {
    const bookings = storage.get<FacilityBooking[]>("campus_bookings") || []

    const newBooking: FacilityBooking = {
      ...booking,
      id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    bookings.push(newBooking)
    storage.set("campus_bookings", bookings)
    return newBooking
  },

  updateBookingStatus: (id: string, status: "pending" | "approved" | "rejected" | "cancelled"): FacilityBooking | null => {
    const bookings = storage.get<FacilityBooking[]>("campus_bookings") || []
    const booking = bookings.find((b) => b.id === id)
    if (!booking) return null

    booking.status = status
    storage.set("campus_bookings", bookings)
    return booking
  },

  cancelBooking: (id: string): void => {
    const bookings = storage.get<FacilityBooking[]>("campus_bookings") || []
    const booking = bookings.find((b) => b.id === id)
    if (booking) {
      booking.status = "cancelled"
      storage.set("campus_bookings", bookings)
    }
  },

  getFacilityBookings: (facilityId: string): FacilityBooking[] => {
    const bookings = campusService.getAllBookings()
    return bookings.filter((b) => b.facilityId === facilityId && b.status === "approved")
  },

  getCampusStats: () => {
    const facilities = campusService.getAllFacilities()
    const departments = campusService.getAllDepartments()
    const bookings = campusService.getAllBookings()

    return {
      totalFacilities: facilities.length,
      availableFacilities: facilities.filter((f) => f.availability === "available").length,
      totalDepartments: departments.length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
      facilityTypes: [...new Set(facilities.map((f) => f.type))].length,
    }
  },
}
