-- Check triggers on orders table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders';

-- Check functions that might be called by triggers
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%order%' OR routine_definition LIKE '%net.http_post%';

-- Check if pg_net extension is properly installed
SELECT * FROM pg_extension WHERE extname = 'pg_net'; 