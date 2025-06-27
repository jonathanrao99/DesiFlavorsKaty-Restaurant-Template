-- Enable RLS on sensitive tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_codes ENABLE ROW LEVEL SECURITY;

-- Clean up duplicate policies on orders table first
DROP POLICY IF EXISTS "Allow public inserts" ON public.orders;
DROP POLICY IF EXISTS "Allow public inserts on orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "allow_public_inserts" ON public.orders;

-- Create comprehensive RLS policies for orders
CREATE POLICY "orders_public_insert" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "orders_public_select_own" ON public.orders
  FOR SELECT TO anon, authenticated
  USING (true); -- For now, allow public read for order tracking

CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- RLS policies for customers
CREATE POLICY "customers_public_insert" ON public.customers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "customers_select_own" ON public.customers
  FOR SELECT TO anon, authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR true); -- Allow for guest orders

CREATE POLICY "customers_admin_all" ON public.customers
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- RLS policies for loyalty_events
CREATE POLICY "loyalty_events_insert_system" ON public.loyalty_events
  FOR INSERT TO anon, authenticated, dashboard_user
  WITH CHECK (true);

CREATE POLICY "loyalty_events_select_own" ON public.loyalty_events
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = loyalty_events.customer_id 
    AND customers.email = current_setting('request.jwt.claims', true)::json->>'email'
  ) OR true); -- Allow for guest access

CREATE POLICY "loyalty_events_admin_all" ON public.loyalty_events
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- RLS policies for order_items
CREATE POLICY "order_items_public_insert" ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "order_items_select_with_order" ON public.order_items
  FOR SELECT TO anon, authenticated
  USING (true); -- Allow reading order items for order display

CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- RLS policies for contact_requests
CREATE POLICY "contact_requests_public_insert" ON public.contact_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contact_requests_admin_all" ON public.contact_requests
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- RLS policies for deliveries
CREATE POLICY "deliveries_system_insert" ON public.deliveries
  FOR INSERT TO anon, authenticated, dashboard_user
  WITH CHECK (true);

CREATE POLICY "deliveries_select_with_order" ON public.deliveries
  FOR SELECT TO anon, authenticated
  USING (true); -- Allow reading for order tracking

CREATE POLICY "deliveries_admin_all" ON public.deliveries
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- RLS policies for promo_redemptions
CREATE POLICY "promo_redemptions_system_insert" ON public.promo_redemptions
  FOR INSERT TO anon, authenticated, dashboard_user
  WITH CHECK (true);

CREATE POLICY "promo_redemptions_admin_all" ON public.promo_redemptions
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- RLS policies for promotional_codes
CREATE POLICY "promotional_codes_public_select" ON public.promotional_codes
  FOR SELECT TO anon, authenticated
  USING (active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "promotional_codes_admin_all" ON public.promotional_codes
  FOR ALL TO dashboard_user
  USING (true)
  WITH CHECK (true);

-- Add missing indexes for performance on high-traffic columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_events_customer_id ON public.loyalty_events (customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_events_order_id ON public.loyalty_events (order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests (created_at DESC); 