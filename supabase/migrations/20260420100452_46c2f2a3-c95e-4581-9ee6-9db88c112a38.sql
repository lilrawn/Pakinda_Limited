CREATE OR REPLACE FUNCTION public.is_aal2()
RETURNS BOOLEAN LANGUAGE SQL STABLE
SET search_path = public
AS $$ SELECT COALESCE((auth.jwt() ->> 'aal') = 'aal2', false) $$;