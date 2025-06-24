-- Temporarily disable all triggers on orders table to fix the immediate issue
ALTER TABLE orders DISABLE TRIGGER ALL;

-- Check if there are any RLS policies that might be calling functions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- Check for any functions that might be automatically called
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name ILIKE '%order%' 
   OR routine_definition ILIKE '%net.http_post%'
   OR routine_definition ILIKE '%orders%';

-- Re-enable triggers (comment this out if you want to keep them disabled for now)
-- ALTER TABLE orders ENABLE TRIGGER ALL; 