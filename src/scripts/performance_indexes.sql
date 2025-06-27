-- Performance Indexes for Desi Flavors Hub Database
-- Run this script to add indexes on high-traffic columns for better query performance

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders (order_type);
CREATE INDEX IF NOT EXISTS idx_orders_customer_created_at ON public.orders (customer_id, created_at DESC);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items (menu_item_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_created ON public.order_items (menu_item_id, created_at DESC);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers (created_at DESC);

-- Analytics events table indexes (critical for performance)
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created ON public.analytics_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON public.analytics_events (user_id, created_at DESC);

-- GIN index for JSONB event_data column (for efficient JSON queries)
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_data_gin ON public.analytics_events USING GIN (event_data);

-- Loyalty events table indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_events_customer_id ON public.loyalty_events (customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_created_at ON public.loyalty_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_event_type ON public.loyalty_events (event_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_order_id ON public.loyalty_events (order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_customer_created ON public.loyalty_events (customer_id, created_at DESC);

-- Promo redemptions table indexes
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_customer_id ON public.promo_redemptions (customer_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_promo_code_id ON public.promo_redemptions (promotional_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_order_id ON public.promo_redemptions (order_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_redeemed_at ON public.promo_redemptions (redeemed_at DESC);

-- Promotional codes table indexes
CREATE INDEX IF NOT EXISTS idx_promotional_codes_code ON public.promotional_codes (code);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_active ON public.promotional_codes (active);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_valid_dates ON public.promotional_codes (valid_from, valid_until);

-- Menu items table indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items (available);
CREATE INDEX IF NOT EXISTS idx_menu_items_price ON public.menu_items (price);

-- Deliveries table indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries (order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_partner ON public.deliveries (delivery_partner);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries (delivery_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_time ON public.deliveries (scheduled_delivery_time);

-- Contact requests table indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests (status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_type ON public.contact_requests (request_type);

-- Newsletter subscribers table indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON public.newsletter_subscribers (subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON public.newsletter_subscribers (is_active);

-- Newsletter campaigns table indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON public.newsletter_campaigns (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON public.newsletter_campaigns (status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_customer_status_created ON public.orders (customer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_customer_type_created ON public.loyalty_events (customer_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_user_created ON public.analytics_events (event_name, user_id, created_at DESC);

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_orders_pending ON public.orders (created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_completed ON public.orders (created_at DESC) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_promotional_codes_active_codes ON public.promotional_codes (code, valid_until) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_available_items ON public.menu_items (category, price) WHERE available = true;

-- Indexes for RLS policies performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_rls ON public.orders (customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_loyalty_events_customer_rls ON public.loyalty_events (customer_id) WHERE customer_id IS NOT NULL;

-- Expression indexes for common calculations
CREATE INDEX IF NOT EXISTS idx_orders_total_amount_numeric ON public.orders ((total_amount::numeric));
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_date ON public.analytics_events (DATE(created_at));

-- Indexes for view performance
CREATE INDEX IF NOT EXISTS idx_orders_date_trunc_day ON public.orders (DATE_TRUNC('day', created_at));
CREATE INDEX IF NOT EXISTS idx_loyalty_events_points_earned ON public.loyalty_events (points) WHERE event_type = 'earned';
CREATE INDEX IF NOT EXISTS idx_loyalty_events_points_redeemed ON public.loyalty_events (points) WHERE event_type = 'redeemed';

-- Update table statistics after creating indexes
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.customers;
ANALYZE public.analytics_events;
ANALYZE public.loyalty_events;
ANALYZE public.promo_redemptions;
ANALYZE public.promotional_codes;
ANALYZE public.menu_items;
ANALYZE public.deliveries;

-- Create maintenance function to update statistics regularly
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE public.orders;
    ANALYZE public.order_items;
    ANALYZE public.customers;
    ANALYZE public.analytics_events;
    ANALYZE public.loyalty_events;
    ANALYZE public.promo_redemptions;
    ANALYZE public.promotional_codes;
    ANALYZE public.menu_items;
    ANALYZE public.deliveries;
    ANALYZE public.contact_requests;
    ANALYZE public.newsletter_subscribers;
    ANALYZE public.newsletter_campaigns;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring queries
-- Use these to monitor index usage and query performance

-- Check index usage
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- Check table scan statistics
/*
SELECT 
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    seq_tup_read as sequential_tuples_read,
    idx_scan as index_scans,
    idx_tup_fetch as index_tuples_fetched,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;
*/

-- Check slow queries (requires pg_stat_statements extension)
/*
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%public.%'
ORDER BY mean_time DESC
LIMIT 10;
*/

-- Check index sizes
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
*/ 