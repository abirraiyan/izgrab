-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create admin_users table (legacy fallback just in case)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS on profiles and admin_users tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Security helper function to check if active user is a super admin
-- Uses SECURITY DEFINER to query the profiles table without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create RLS Policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can perform full CRUD" ON public.profiles;
CREATE POLICY "Super admins can perform full CRUD" ON public.profiles
  FOR ALL TO authenticated USING (public.is_super_admin());

-- 6. Create RLS Policies for admin_users (Allows authenticated users to check their own role)
DROP POLICY IF EXISTS "Users can check own admin status" ON public.admin_users;
CREATE POLICY "Users can check own admin status" ON public.admin_users
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Super admins can manage admin_users" ON public.admin_users
  FOR ALL TO authenticated USING (public.is_super_admin());

-- 7. Trigger function to automatically sync users to profiles and admin_users tables
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  -- Determine role based on email or user metadata
  IF (new.email = 'raiyan.abir@gmail.com' OR new.email = 'izgrab@xceptionist.com') THEN
    assigned_role := 'super_admin';
  ELSIF (new.raw_user_meta_data->>'role' = 'super_admin') THEN
    assigned_role := 'super_admin';
  ELSIF (
    new.raw_user_meta_data->>'role' = 'admin' OR
    new.raw_user_meta_data->>'is_admin' = 'true' OR
    (new.raw_user_meta_data->'is_admin')::boolean = true
  ) THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'user';
  END IF;

  -- Sync with profiles table
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, assigned_role)
  ON CONFLICT (id) DO UPDATE
  SET email = excluded.email,
      role = excluded.role,
      updated_at = now();

  -- Sync with admin_users table (compatibility for legacy features)
  IF (assigned_role = 'admin' OR assigned_role = 'super_admin') THEN
    INSERT INTO public.admin_users (id, email)
    VALUES (new.id, new.email)
    ON CONFLICT (email) DO NOTHING;
  ELSE
    DELETE FROM public.admin_users WHERE email = new.email;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger to execute the function on any user creation or metadata update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- 9. Backfill existing auth users to profiles and admin_users tables
INSERT INTO public.profiles (id, email, role)
SELECT 
  id, 
  email,
  CASE 
    WHEN (email = 'raiyan.abir@gmail.com' OR email = 'izgrab@xceptionist.com') THEN 'super_admin'
    WHEN (raw_user_meta_data->>'role' = 'super_admin') THEN 'super_admin'
    WHEN (
      raw_user_meta_data->>'role' = 'admin' OR
      raw_user_meta_data->>'is_admin' = 'true' OR
      (raw_user_meta_data->'is_admin')::boolean = true
    ) THEN 'admin'
    ELSE 'user'
  END as role
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = excluded.email,
    role = excluded.role,
    updated_at = now();

INSERT INTO public.admin_users (id, email)
SELECT id, email
FROM auth.users
WHERE (
  email = 'raiyan.abir@gmail.com' OR 
  email = 'izgrab@xceptionist.com' OR
  raw_user_meta_data->>'role' = 'super_admin' OR
  raw_user_meta_data->>'role' = 'admin' OR
  raw_user_meta_data->>'is_admin' = 'true' OR
  (raw_user_meta_data->'is_admin')::boolean = true
)
ON CONFLICT (email) DO NOTHING;
