-- Phase 1: Critical Security Fixes

-- 1. Backfill any NULL vault_salt values with secure random salts
UPDATE public.profiles 
SET vault_salt = encode(gen_random_bytes(32), 'hex')
WHERE vault_salt IS NULL;

-- 2. Make vault_salt NOT NULL to prevent future NULL values
ALTER TABLE public.profiles 
ALTER COLUMN vault_salt SET NOT NULL;

-- 3. Add INSERT policy for profiles table to enable defense-in-depth
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);