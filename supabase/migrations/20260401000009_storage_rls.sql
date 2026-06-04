-- Storage RLS — staff uploads, public read on public/avatars buckets
-- Hosted Supabase already enables RLS on storage.objects; skip ALTER (requires table owner).

-- Public bucket: anyone reads; staff uploads/updates/deletes
DROP POLICY IF EXISTS storage_public_read ON storage.objects;
CREATE POLICY storage_public_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'public');

DROP POLICY IF EXISTS storage_public_staff_write ON storage.objects;
CREATE POLICY storage_public_staff_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public' AND public.is_staff());

DROP POLICY IF EXISTS storage_public_staff_update ON storage.objects;
CREATE POLICY storage_public_staff_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'public' AND public.is_staff())
  WITH CHECK (bucket_id = 'public' AND public.is_staff());

DROP POLICY IF EXISTS storage_public_staff_delete ON storage.objects;
CREATE POLICY storage_public_staff_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'public' AND public.is_staff());

-- Avatars: public read, staff write
DROP POLICY IF EXISTS storage_avatars_read ON storage.objects;
CREATE POLICY storage_avatars_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS storage_avatars_staff_write ON storage.objects;
CREATE POLICY storage_avatars_staff_write ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND public.is_staff())
  WITH CHECK (bucket_id = 'avatars' AND public.is_staff());

-- Resources (private bucket): staff manage; authenticated read (signed URLs via API)
DROP POLICY IF EXISTS storage_resources_staff ON storage.objects;
CREATE POLICY storage_resources_staff ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'resources' AND public.is_staff())
  WITH CHECK (bucket_id = 'resources' AND public.is_staff());

DROP POLICY IF EXISTS storage_resources_auth_read ON storage.objects;
CREATE POLICY storage_resources_auth_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resources');
