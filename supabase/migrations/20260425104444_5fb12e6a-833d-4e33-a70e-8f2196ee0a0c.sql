DROP POLICY IF EXISTS "CMS media is publicly visible" ON storage.objects;

UPDATE storage.buckets
SET public = false
WHERE id = 'cms-media';