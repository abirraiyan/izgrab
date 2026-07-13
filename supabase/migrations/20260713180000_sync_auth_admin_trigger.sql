-- Create trigger function to automatically sync users to admin_users table
CREATE OR REPLACE FUNCTION public.handle_auth_user_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user metadata contains role = 'admin'
  IF (new.raw_user_meta_data->>'role' = 'admin') THEN
    INSERT INTO public.admin_users (id, email)
    VALUES (new.id, new.email)
    ON CONFLICT (email) DO NOTHING;
  ELSE
    -- If the role is changed away from admin, remove them from the admin table
    DELETE FROM public.admin_users WHERE email = new.email;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on any user creation or metadata update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_role_change();
