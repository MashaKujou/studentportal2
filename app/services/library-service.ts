import { STORAGE_KEYS } from "@/lib/constants"
import { storage } from "@/lib/storage"

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  copies: number
  availableCopies: number
  description: string
  publishYear: number
  location: string
  createdAt: string
}

export interface Checkout {
  id: string
  bookId: string
  studentId: string
  checkoutDate: string
  dueDate: string
  returnDate?: string
  status: "active" | "overdue" | "returned"
  createdAt: string
}

export interface Reservation {
  id: string
  bookId: string
  studentId: string
  reservationDate: string
  expectedAvailableDate?: string
  status: "pending" | "ready" | "cancelled"
  createdAt: string
}

export const libraryService = {
  // Book management
  getAllBooks: (): Book[] => {
    return storage.get<Book[]>(STORAGE_KEYS.LIBRARY_CATALOG) || []
  },

  searchBooks: (query: string): Book[] => {
    const books = libraryService.getAllBooks()
    const lowerQuery = query.toLowerCase()
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.author.toLowerCase().includes(lowerQuery) ||
        b.isbn.includes(query) ||
        b.category.toLowerCase().includes(lowerQuery)
    )
  },

  getBookById: (id: string): Book | null => {
    const books = libraryService.getAllBooks()
    return books.find((b) => b.id === id) || null
  },

  addBook: (book: Omit<Book, "id" | "createdAt">): Book => {
    const books = libraryService.getAllBooks()
    const newBook: Book = {
      ...book,
      id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    books.push(newBook)
    storage.set(STORAGE_KEYS.LIBRARY_CATALOG, books)
    return newBook
  },

  updateBook: (id: string, updates: Partial<Book>): Book | null => {
    const books = libraryService.getAllBooks()
    const book = books.find((b) => b.id === id)
    if (!book) return null

    Object.assign(book, updates)
    storage.set(STORAGE_KEYS.LIBRARY_CATALOG, books)
    return book
  },

  deleteBook: (id: string): void => {
    const books = libraryService.getAllBooks()
    const filtered = books.filter((b) => b.id !== id)
    storage.set(STORAGE_KEYS.LIBRARY_CATALOG, filtered)
  },

  // Checkout management
  getStudentCheckouts: (studentId: string): Checkout[] => {
    const checkouts = storage.get<Checkout[]>(STORAGE_KEYS.LIBRARY_CHECKOUTS) || []
    return checkouts
      .filter((c) => c.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getAllCheckouts: (): Checkout[] => {
    return storage.get<Checkout[]>(STORAGE_KEYS.LIBRARY_CHECKOUTS) || []
  },

  checkoutBook: (bookId: string, studentId: string, dueDays: number = 14): Checkout => {
    const checkouts = storage.get<Checkout[]>(STORAGE_KEYS.LIBRARY_CHECKOUTS) || []
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    const newCheckout: Checkout = {
      id: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      studentId,
      checkoutDate: new Date().toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      status: "active",
      createdAt: new Date().toISOString(),
    }

    checkouts.push(newCheckout)
    storage.set(STORAGE_KEYS.LIBRARY_CHECKOUTS, checkouts)

    // Update book available copies
    const book = libraryService.getBookById(bookId)
    if (book && book.availableCopies > 0) {
      libraryService.updateBook(bookId, { availableCopies: book.availableCopies - 1 })
    }

    return newCheckout
  },

  returnBook: (checkoutId: string): Checkout | null => {
    const checkouts = storage.get<Checkout[]>(STORAGE_KEYS.LIBRARY_CHECKOUTS) || []
    const checkout = checkouts.find((c) => c.id === checkoutId)
    if (!checkout) return null

    checkout.returnDate = new Date().toISOString().split("T")[0]
    const today = new Date()
    const dueDate = new Date(checkout.dueDate)
    checkout.status = today > dueDate ? "overdue" : "returned"

    storage.set(STORAGE_KEYS.LIBRARY_CHECKOUTS, checkouts)

    // Update book available copies
    const book = libraryService.getBookById(checkout.bookId)
    if (book) {
      libraryService.updateBook(checkout.bookId, { availableCopies: book.availableCopies + 1 })
    }

    return checkout
  },

  getOverdueBooks: (): Checkout[] => {
    const checkouts = libraryService.getAllCheckouts()
    const today = new Date()
    return checkouts.filter((c) => {
      const dueDate = new Date(c.dueDate)
      return c.status === "active" && today > dueDate
    })
  },

  // Reservation management
  getStudentReservations: (studentId: string): Reservation[] => {
    const reservations = storage.get<Reservation[]>(STORAGE_KEYS.LIBRARY_CHECKOUTS) || []
    return reservations
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  reserveBook: (bookId: string, studentId: string): Reservation => {
    // Store reservations in library checkouts for simplicity
    const reservations = storage.get<Reservation[]>("library_reservations") || []

    const newReservation: Reservation = {
      id: `reserve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      studentId,
      reservationDate: new Date().toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    reservations.push(newReservation)
    storage.set("library_reservations", reservations)
    return newReservation
  },

  cancelReservation: (reservationId: string): void => {
    const reservations = storage.get<Reservation[]>("library_reservations") || []
    const filtered = reservations.filter((r) => r.id !== reservationId)
    storage.set("library_reservations", filtered)
  },

  getLibraryStats: () => {
    const books = libraryService.getAllBooks()
    const checkouts = libraryService.getAllCheckouts()
    const activeCheckouts = checkouts.filter((c) => c.status === "active")
    const overdueCheckouts = libraryService.getOverdueBooks()

    return {
      totalBooks: books.length,
      totalCopies: books.reduce((sum, b) => sum + b.copies, 0),
      availableCopies: books.reduce((sum, b) => sum + b.availableCopies, 0),
      activeCheckouts: activeCheckouts.length,
      overdueCheckouts: overdueCheckouts.length,
      categories: [...new Set(books.map((b) => b.category))].length,
    }
  },
}
