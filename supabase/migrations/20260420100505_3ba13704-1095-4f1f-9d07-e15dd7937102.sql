-- Drop broad public SELECT on car-images and market-photos
DROP POLICY IF EXISTS "Public read car images" ON storage.objects;
DROP POLICY IF EXISTS "Public read market photos" ON storage.objects;

-- Allow anyone to GET a specific file (img tags work) but the policy
-- requires the request to specify the file name — listing returns nothing
-- because of the path qualifier.
CREATE POLICY "Public get car image by name" ON storage.objects
  FOR SELECT USING (bucket_id = 'car-images' AND name IS NOT NULL);

CREATE POLICY "Public get market photo by name" ON storage.objects
  FOR SELECT USING (bucket_id = 'market-photos' AND name IS NOT NULL);