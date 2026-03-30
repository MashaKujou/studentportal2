-- Insert admin user into users table and admins role table
WITH new_user AS (
  INSERT INTO public.users (
    email,
    password_hash,
    full_name,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    'Admin.CSAEDU@csa.edu.co',
    'Admin123!',
    'Admin CSAEDU',
    'admin',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ) RETURNING id
)
INSERT INTO public.admins (
  user_id,
  admin_id,
  permission_level,
  created_at,
  updated_at
) SELECT
  id,
  'ADMIN_CSA_001',
  'full_access',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM new_user;

-- Verify the admin was created
SELECT * FROM public.users WHERE email = 'Admin.CSAEDU@csa.edu.co';
