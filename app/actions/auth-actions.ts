'use server'

import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function loginUser(email: string, password: string) {
  try {
    // Query users table using service role
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)

    if (usersError || !usersData || usersData.length === 0) {
      throw new Error('Invalid email or password')
    }

    const userData = usersData[0]

    // Verify password
    if (userData.password_hash !== password) {
      throw new Error('Invalid email or password')
    }

    // Fetch role-specific data
    let roleData = null
    if (userData.role === 'student') {
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userData.id)
        .single()
      roleData = studentData
    } else if (userData.role === 'teacher') {
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', userData.id)
        .single()
      roleData = teacherData
    } else if (userData.role === 'admin') {
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userData.id)
        .single()
      roleData = adminData
    }

    return {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        status: userData.status,
        profilePictureUrl: userData.profile_picture_url,
        ...(roleData && { roleData }),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}
