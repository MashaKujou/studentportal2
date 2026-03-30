'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  file_url?: string
  file_type?: 'pdf' | 'epub'
  createdAt: string
}

export interface Checkout {
  id: string
  bookId: string
  studentId: string
  checkoutDate: string
  dueDate: string
  returnDate?: string
  status: 'active' | 'overdue' | 'returned'
  createdAt: string
}

export interface Reservation {
  id: string
  bookId: string
  studentId: string
  reservationDate: string
  expectedAvailableDate?: string
  status: 'pending' | 'ready' | 'cancelled'
  createdAt: string
}

export const libraryService = {
  // Book management
  getAllBooks: async (): Promise<Book[]> => {
    const { data, error } = await supabase
      .from('library_books')
      .select('*')
      .order('title', { ascending: true })

    if (error) {
      console.error('Error fetching books:', error)
      return []
    }
    return data || []
  },

  searchBooks: async (query: string): Promise<Book[]> => {
    const { data, error } = await supabase
      .from('library_books')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`)

    if (error) {
      console.error('Error searching books:', error)
      return []
    }
    return data || []
  },

  getBookById: async (id: string): Promise<Book | null> => {
    const { data, error } = await supabase
      .from('library_books')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching book:', error)
      return null
    }
    return data
  },

  addBook: async (book: Omit<Book, 'id' | 'createdAt'>, fileUrl?: string, fileType?: 'pdf' | 'epub'): Promise<Book | null> => {
    const { data, error } = await supabase
      .from('library_books')
      .insert([
        {
          ...book,
          file_url: fileUrl,
          file_type: fileType,
        },
      ])
      .select()

    if (error) {
      console.error('Error adding book:', error)
      return null
    }
    return data?.[0] || null
  },

  updateBook: async (id: string, updates: Partial<Book>): Promise<Book | null> => {
    const { data, error } = await supabase
      .from('library_books')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating book:', error)
      return null
    }
    return data?.[0] || null
  },

  deleteBook: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('library_books')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting book:', error)
      return false
    }
    return true
  },

  // Checkout management
  getStudentCheckouts: async (studentId: string): Promise<Checkout[]> => {
    const { data, error } = await supabase
      .from('library_checkouts')
      .select(`
        *,
        book:library_books(*)
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching checkouts:', error)
      return []
    }
    return data || []
  },

  getAllCheckouts: async (): Promise<Checkout[]> => {
    const { data, error } = await supabase
      .from('library_checkouts')
      .select(`
        *,
        book:library_books(*),
        student:users(*)
      `)
      .order('checkout_date', { ascending: false })

    if (error) {
      console.error('Error fetching all checkouts:', error)
      return []
    }
    return data || []
  },

  checkoutBook: async (bookId: string, studentId: string, dueDays: number = 14): Promise<Checkout | null> => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    const { data, error } = await supabase
      .from('library_checkouts')
      .insert([
        {
          book_id: bookId,
          student_id: studentId,
          checkout_date: new Date().toISOString(),
          due_date: dueDate.toISOString(),
          status: 'active',
        },
      ])
      .select()

    if (!error) {
      const book = await libraryService.getBookById(bookId)
      if (book && book.availableCopies > 0) {
        await libraryService.updateBook(bookId, {
          availableCopies: book.availableCopies - 1,
        })
      }
    }

    if (error) {
      console.error('Error checking out book:', error)
      return null
    }
    return data?.[0] || null
  },

  returnBook: async (checkoutId: string): Promise<Checkout | null> => {
    const { data: checkout, error: checkoutError } = await supabase
      .from('library_checkouts')
      .select('*')
      .eq('id', checkoutId)
      .single()

    if (checkoutError) {
      console.error('Error fetching checkout:', checkoutError)
      return null
    }

    const { data, error } = await supabase
      .from('library_checkouts')
      .update({
        return_date: new Date().toISOString(),
        status: 'returned',
      })
      .eq('id', checkoutId)
      .select()

    if (!error) {
      const book = await libraryService.getBookById(checkout.book_id)
      if (book) {
        await libraryService.updateBook(checkout.book_id, {
          availableCopies: book.availableCopies + 1,
        })
      }
    }

    if (error) {
      console.error('Error returning book:', error)
      return null
    }
    return data?.[0] || null
  },

  getOverdueBooks: async (): Promise<Checkout[]> => {
    const { data, error } = await supabase
      .from('library_checkouts')
      .select('*')
      .eq('status', 'active')
      .lt('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching overdue books:', error)
      return []
    }
    return data || []
  },

  getLibraryStats: async () => {
    const books = await libraryService.getAllBooks()
    const checkouts = await libraryService.getAllCheckouts()
    const activeCheckouts = checkouts.filter((c) => c.status === 'active')
    const overdueCheckouts = await libraryService.getOverdueBooks()

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
