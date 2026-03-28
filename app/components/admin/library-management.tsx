'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { libraryService, Book, Checkout } from '@/app/services/library-service'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { Student } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react'

export function AdminLibraryManagement() {
  const [books, setBooks] = useState<Book[]>(() => libraryService.getAllBooks())
  const [checkouts, setCheckouts] = useState<Checkout[]>(() => libraryService.getAllCheckouts())

  // Add book form
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [category, setCategory] = useState('')
  const [copies, setCopies] = useState('')
  const [description, setDescription] = useState('')
  const [publishYear, setPublishYear] = useState('')
  const [location, setLocation] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []
  const stats = libraryService.getLibraryStats()

  const handleAddBook = () => {
    if (!title || !author || !isbn || !copies || !publishYear) {
      alert('Please fill in all required fields')
      return
    }

    libraryService.addBook({
      title,
      author,
      isbn,
      category,
      copies: parseInt(copies),
      availableCopies: parseInt(copies),
      description,
      publishYear: parseInt(publishYear),
      location,
    })

    setBooks(libraryService.getAllBooks())
    setSuccessMessage('Book added successfully')
    setTitle('')
    setAuthor('')
    setIsbn('')
    setCategory('')
    setCopies('')
    setDescription('')
    setPublishYear('')
    setLocation('')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleDeleteBook = (id: string) => {
    if (confirm('Are you sure you want to delete this book? This will affect all checkouts.')) {
      libraryService.deleteBook(id)
      setBooks(libraryService.getAllBooks())
    }
  }

  const handleRecordCheckout = () => {
    // This would be implemented with a form modal in a real app
    alert('Use the student portal to record checkouts')
  }

  const handleReturnBook = (checkoutId: string) => {
    libraryService.returnBook(checkoutId)
    setCheckouts(libraryService.getAllCheckouts())
    setSuccessMessage('Book return recorded successfully')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const getStudent = (studentId: string) => students.find((s) => s.id === studentId)

  const overdueCheckouts = libraryService.getOverdueBooks()
  const activeCheckouts = checkouts.filter((c) => c.status === 'active')

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="catalog">Manage Catalog</TabsTrigger>
        <TabsTrigger value="checkouts">Checkouts & Returns</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">{stats.totalCopies} copies available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Copies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.availableCopies}</div>
              <p className="text-xs text-muted-foreground">Ready for checkout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Checkouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCheckouts}</div>
              <p className="text-xs text-muted-foreground">Books checked out</p>
            </CardContent>
          </Card>
        </div>

        {overdueCheckouts.length > 0 && (
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="text-red-900">Overdue Books Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 mb-3">{overdueCheckouts.length} book(s) are overdue</p>
              <div className="space-y-2">
                {overdueCheckouts.map((checkout) => {
                  const book = libraryService.getBookById(checkout.bookId)
                  const student = getStudent(checkout.studentId)
                  return (
                    <div key={checkout.id} className="text-sm text-red-800">
                      {book?.title} - {student?.firstName} {student?.lastName} (Due:{' '}
                      {new Date(checkout.dueDate).toLocaleDateString()})
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="catalog" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New Book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Book title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Author *</label>
                <Input
                  placeholder="Author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ISBN *</label>
                <Input
                  placeholder="ISBN"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g., Fiction, Reference"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Copies *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Publish Year *</label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={publishYear}
                  onChange={(e) => setPublishYear(e.target.value)}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="e.g., Shelf A-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Book description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleAddBook} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book Catalog</CardTitle>
            <CardDescription>{books.length} books in catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {books.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No books in catalog</p>
              </div>
            ) : (
              <div className="space-y-2">
                {books.map((book) => (
                  <Card key={book.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{book.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              ISBN: {book.isbn}
                            </Badge>
                            {book.category && (
                              <Badge variant="outline" className="text-xs">
                                {book.category}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Copies: {book.availableCopies}/{book.copies}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBook(book.id)}
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

      <TabsContent value="checkouts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Checkouts</CardTitle>
            <CardDescription>{activeCheckouts.length} books currently checked out</CardDescription>
          </CardHeader>
          <CardContent>
            {activeCheckouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active checkouts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCheckouts.map((checkout) => {
                  const book = libraryService.getBookById(checkout.bookId)
                  const student = getStudent(checkout.studentId)
                  const isOverdue = new Date() > new Date(checkout.dueDate)
                  return (
                    <Card key={checkout.id} className={isOverdue ? 'border-red-200 bg-red-50/30' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{book?.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              Student: {student?.firstName} {student?.lastName}
                            </p>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p>Checkout: {new Date(checkout.checkoutDate).toLocaleDateString()}</p>
                              <p className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                Due: {new Date(checkout.dueDate).toLocaleDateString()}
                                {isOverdue && ' (OVERDUE)'}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleReturnBook(checkout.id)}
                            variant="outline"
                            size="sm"
                          >
                            Mark Returned
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
    </Tabs>
  )
}
