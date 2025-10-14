-- Check actual structure of reviews table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;

-- Check sample data from reviews table
SELECT * FROM reviews LIMIT 3;


