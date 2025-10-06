-- Add vault_salt to profiles for unique per-user encryption
ALTER TABLE public.profiles ADD COLUMN vault_salt TEXT;

-- Update handle_new_user function to be secure and generate vault salt
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, vault_salt)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    encode(gen_random_bytes(32), 'hex')
  );
  RETURN new;
END;
$function$;