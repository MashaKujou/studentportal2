'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { libraryService, Book, Checkout } from '@/app/services/library-service'
import { useAuth } from '@/app/contexts/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, BookOpen, Calendar, MapPin } from 'lucide-react'

export function StudentLibrary() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadLibraryData()
  }, [user])

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredBooks(libraryService.searchBooks(searchQuery))
    } else {
      setFilteredBooks(books)
    }
  }, [searchQuery, books])

  const loadLibraryData = () => {
    if (!user) return
    const allBooks = libraryService.getAllBooks()
    const studentCheckouts = libraryService.getStudentCheckouts(user.id)
    setBooks(allBooks)
    setCheckouts(studentCheckouts)
  }

  const handleCheckout = (bookId: string) => {
    if (!user) return

    const book = libraryService.getBookById(bookId)
    if (!book || book.availableCopies <= 0) {
      alert('This book is not available for checkout')
      return
    }

    libraryService.checkoutBook(bookId, user.id)
    setSuccessMessage('Book checked out successfully!')
    loadLibraryData()
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleReturn = (checkoutId: string) => {
    libraryService.returnBook(checkoutId)
    setSuccessMessage('Book returned successfully!')
    loadLibraryData()
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate)
  }

  return (
    <Tabs defaultValue="search" className="space-y-4">
      <TabsList>
        <TabsTrigger value="search">Search Books</TabsTrigger>
        <TabsTrigger value="current">My Checkouts</TabsTrigger>
        <TabsTrigger value="history">Return History</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Search Library Catalog</CardTitle>
            <CardDescription>Find books by title, author, ISBN, or category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="space-y-2">
              {filteredBooks.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6 text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No books found matching your search' : 'Enter a search query'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{book.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {book.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ISBN: {book.isbn}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {book.location}
                            </p>
                            <p>Published: {book.publishYear}</p>
                          </div>
                          {book.description && (
                            <p className="text-xs mt-2 text-muted-foreground italic">{book.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-2">Available</p>
                          <p className="text-2xl font-bold mb-3">{book.availableCopies}/{book.copies}</p>
                          <Button
                            onClick={() => handleCheckout(book.id)}
                            disabled={book.availableCopies <= 0}
                            className="w-full"
                          >
                            Checkout
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="current" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Checkouts</CardTitle>
            <CardDescription>Books you currently have checked out</CardDescription>
          </CardHeader>
          <CardContent>
            {checkouts.filter((c) => c.status === 'active').length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">You have no active checkouts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkouts
                  .filter((c) => c.status === 'active')
                  .map((checkout) => {
                    const book = libraryService.getBookById(checkout.bookId)
                    const overdue = isOverdue(checkout.dueDate)
                    return (
                      <Card key={checkout.id} className={overdue ? 'border-red-200 bg-red-50/30' : ''}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{book?.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">by {book?.author}</p>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Checked out: {new Date(checkout.checkoutDate).toLocaleDateString()}
                                </p>
                                <p
                                  className={`flex items-center gap-1 font-semibold ${
                                    overdue ? 'text-red-600' : 'text-green-600'
                                  }`}
                                >
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(checkout.dueDate).toLocaleDateString()}
                                  {overdue && ' (OVERDUE)'}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleReturn(checkout.id)}
                              variant="outline"
                            >
                              Return
                            </Button>
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

      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Return History</CardTitle>
            <CardDescription>Books you have returned</CardDescription>
          </CardHeader>
          <CardContent>
            {checkouts.filter((c) => c.status !== 'active').length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No return history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {checkouts
                  .filter((c) => c.status !== 'active')
                  .map((checkout) => {
                    const book = libraryService.getBookById(checkout.bookId)
                    return (
                      <Card key={checkout.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{book?.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">by {book?.author}</p>
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <p>Checked out: {new Date(checkout.checkoutDate).toLocaleDateString()}</p>
                                <p>Due: {new Date(checkout.dueDate).toLocaleDateString()}</p>
                                {checkout.returnDate && (
                                  <p>Returned: {new Date(checkout.returnDate).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                            <Badge className={getStatusColor(checkout.status)} variant="secondary">
                              {checkout.status === 'overdue' ? 'Overdue' : 'Returned'}
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
