CREATE POLICY "admin settings read" ON public.site_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.site_settings TO anon, authenticated;