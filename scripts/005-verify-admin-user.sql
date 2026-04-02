-- Verify admin user exists and has proper permissions
SELECT u.id, u.email, u.role, a.permission_level 
FROM public.users u
LEFT JOIN public.admins a ON u.id = a.user_id
WHERE u.email = 'Admin.CSAEDU@csa.edu.co';

-- If admin record doesn't exist, create it
INSERT INTO public.admins (user_id, admin_id, permission_level, created_at, updated_at)
SELECT id, 'ADMIN_001', 'full_access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM public.users
WHERE email = 'Admin.CSAEDU@csa.edu.co'
AND id NOT IN (SELECT user_id FROM public.admins WHERE user_id IS NOT NULL);
