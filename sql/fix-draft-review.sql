-- Update the first review from draft to published
UPDATE reviews 
SET status = 'published' 
WHERE id = '9b3e3329-f1fd-4583-b593-64c6e9a01e77';

-- Verify the update
SELECT 
    id,
    slug,
    video_title,
    status,
    created_at
FROM reviews 
WHERE id = '9b3e3329-f1fd-4583-b593-64c6e9a01e77';


