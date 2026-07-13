-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create admin_users table if it doesn't exist (ensure columns are defined)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS on profiles and admin_users tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 5. Create RLS Policies for admin_users (Allows authenticated users to check their own role)
DROP POLICY IF EXISTS "Users can check own admin status" ON public.admin_users;
CREATE POLICY "Users can check own admin status" ON public.admin_users
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- 6. Trigger function to automatically sync users to profiles and admin_users tables
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  -- Check if the user metadata contains role = 'admin' or is_admin = true
  is_admin_user := (
    new.raw_user_meta_data->>'role' = 'admin' OR
    new.raw_user_meta_data->>'is_admin' = 'true' OR
    (new.raw_user_meta_data->'is_admin')::boolean = true
  );

  -- Sync with profiles table
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE WHEN is_admin_user THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = excluded.email,
      role = excluded.role,
      updated_at = now();

  -- Sync with admin_users table
  IF is_admin_user THEN
    INSERT INTO public.admin_users (id, email)
    VALUES (new.id, new.email)
    ON CONFLICT (email) DO NOTHING;
  ELSE
    DELETE FROM public.admin_users WHERE email = new.email;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to execute the function on any user creation or metadata update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- 8. Backfill existing auth users to profiles and admin_users
INSERT INTO public.profiles (id, email, role)
SELECT 
  id, 
  email,
  CASE WHEN (
    raw_user_meta_data->>'role' = 'admin' OR
    raw_user_meta_data->>'is_admin' = 'true' OR
    (raw_user_meta_data->'is_admin')::boolean = true
  ) THEN 'admin' ELSE 'user' END as role
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = excluded.email,
    role = excluded.role,
    updated_at = now();

INSERT INTO public.admin_users (id, email)
SELECT id, email
FROM auth.users
WHERE (
  raw_user_meta_data->>'role' = 'admin' OR
  raw_user_meta_data->>'is_admin' = 'true' OR
  (raw_user_meta_data->'is_admin')::boolean = true
)
ON CONFLICT (email) DO NOTHING;
