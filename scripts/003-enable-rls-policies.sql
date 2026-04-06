-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own record"
  ON public.students FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.students FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on teachers table
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own record"
  ON public.teachers FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage teachers"
  ON public.teachers FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.teachers FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can manage admins"
  ON public.admins FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.admins FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on classes table
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view classes"
  ON public.classes FOR SELECT
  USING (true);

CREATE POLICY "Teachers can update their own classes"
  ON public.classes FOR UPDATE
  USING (teacher_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all classes"
  ON public.classes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.classes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on grades table
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own grades"
  ON public.grades FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Teachers can insert and update grades"
  ON public.grades FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Teachers can update grades they entered"
  ON public.grades FOR UPDATE
  USING (entered_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all grades"
  ON public.grades FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.grades FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view attendance"
  ON public.attendance FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Teachers and admins can manage attendance"
  ON public.attendance FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Service role can do everything"
  ON public.attendance FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on attendance_details table
ALTER TABLE public.attendance_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their attendance"
  ON public.attendance_details FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Teachers can manage attendance details"
  ON public.attendance_details FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Service role can do everything"
  ON public.attendance_details FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own documents"
  ON public.documents FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Students can upload their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage all documents"
  ON public.documents FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.documents FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on financial_records table
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own financial records"
  ON public.financial_records FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all financial records"
  ON public.financial_records FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.financial_records FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on library_books table
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view library books"
  ON public.library_books FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage library books"
  ON public.library_books FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.library_books FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on library_checkouts table
ALTER TABLE public.library_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own checkouts"
  ON public.library_checkouts FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Students can checkout books"
  ON public.library_checkouts FOR INSERT
  WITH CHECK (student_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all checkouts"
  ON public.library_checkouts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.library_checkouts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all messages"
  ON public.messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can send notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own feedback"
  ON public.feedback FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Students can create feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage all feedback"
  ON public.feedback FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.feedback FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on subjects table
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view subjects"
  ON public.subjects FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.subjects FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on class_enrollments table
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own enrollments"
  ON public.class_enrollments FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'teacher'));

CREATE POLICY "Admins can manage all enrollments"
  ON public.class_enrollments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.class_enrollments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on document_requests table
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own requests"
  ON public.document_requests FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Students can create requests"
  ON public.document_requests FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage all requests"
  ON public.document_requests FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.document_requests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own payments"
  ON public.payments FOR SELECT
  USING (student_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on library_files table
ALTER TABLE public.library_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view library files"
  ON public.library_files FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage library files"
  ON public.library_files FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can do everything"
  ON public.library_files FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
