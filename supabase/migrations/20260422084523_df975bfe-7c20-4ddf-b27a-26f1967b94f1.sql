DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins write fleet" ON public.fleet_cars;
CREATE POLICY "Admins write fleet" ON public.fleet_cars FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage service" ON public.service_records;
CREATE POLICY "Admins manage service" ON public.service_records FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins full bookings" ON public.bookings;
CREATE POLICY "Admins full bookings" ON public.bookings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins full listings" ON public.market_listings;
CREATE POLICY "Admins full listings" ON public.market_listings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins read audit log" ON public.audit_log;
CREATE POLICY "Admins read audit log" ON public.audit_log FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins read all documents" ON storage.objects;
CREATE POLICY "Admins read all documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage car images" ON storage.objects;
CREATE POLICY "Admins manage car images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'car-images' AND has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (bucket_id = 'car-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP FUNCTION IF EXISTS public.is_aal2();