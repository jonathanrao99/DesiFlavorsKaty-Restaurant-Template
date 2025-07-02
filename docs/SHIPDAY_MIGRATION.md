# ShipDay Migration Guide

This document outlines the migration from DoorDash to ShipDay for delivery management in the Desi Flavors Hub application.

## Overview

The application has been migrated from DoorDash Drive API to ShipDay API for delivery management. This migration includes:

- **process-order**: Creates Square orders and ShipDay deliveries for ASAP orders
- **calculate-fee**: Calculates delivery fees using ShipDay's quote API
- **schedule-delivery**: Schedules deliveries for later times
- **process-scheduled-deliveries**: Processes scheduled deliveries when they're ready
- **shipday-webhook**: Handles delivery status updates from ShipDay

## Environment Variables

Add these environment variables to your Supabase project:

### Required Variables

```bash
# ShipDay API Configuration
SHIPDAY_API_KEY=your_shipday_api_key_here

# Store Information
STORE_ADDRESS=1989 North Fry Rd, Katy, TX 77494
STORE_PHONE_NUMBER=+12814010758

# Square Configuration (existing)
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id

# Supabase Configuration (existing)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio Configuration (existing)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_PHONE=your_twilio_from_phone
TWILIO_TO_PHONE=your_twilio_to_phone
```

### Optional Variables

```bash
# Customer email for delivery notifications
CUSTOMER_EMAIL=optional_customer_email
```

## Supabase Edge Functions

### 1. process-order

**Purpose**: Processes new orders and creates ShipDay deliveries for ASAP orders

**Trigger**: Database webhook on orders table insert

**Features**:
- Creates Square orders
- Creates ShipDay deliveries for ASAP orders
- Updates order with delivery tracking information
- Sends Twilio voice notifications
- Handles retry logic for failed deliveries

### 2. calculate-fee

**Purpose**: Calculates delivery fees using ShipDay's quote API

**Endpoint**: `POST /functions/v1/calculate-fee`

**Request Body**:
```json
{
  "address": "customer_delivery_address",
  "dropoffPhoneNumber": "customer_phone_number"
}
```

**Response**:
```json
{
  "fee": 5.50
}
```

### 3. schedule-delivery

**Purpose**: Schedules deliveries for later times

**Endpoint**: `POST /functions/v1/schedule-delivery`

**Request Body**:
```json
{
  "external_delivery_id": "unique_delivery_id",
  "dropoff_address": "customer_address",
  "dropoff_phone_number": "customer_phone"
}
```

### 4. process-scheduled-deliveries

**Purpose**: Processes scheduled deliveries when they're ready (within 1.5 hours of scheduled time)

**Endpoint**: `POST /functions/v1/process-scheduled-deliveries`

**Features**:
- Fetches scheduled orders from database
- Creates ShipDay deliveries for orders ready to be processed
- Updates order status and tracking information
- Calculates prep times based on order complexity

### 5. shipday-webhook

**Purpose**: Handles delivery status updates from ShipDay

**Endpoint**: `POST /functions/v1/shipday-webhook`

**Features**:
- Updates order delivery status
- Stores driver information
- Handles delivery completion notifications
- Maps ShipDay statuses to internal order statuses

## Frontend Changes

### Updated Files

1. **`src/lib/supabaseFunctions.ts`**: New utility file for calling Supabase Edge Functions
2. **`src/lib/deliveryFee.ts`**: Updated to use ShipDay API instead of Google Maps
3. **`src/app/payment/page.tsx`**: Updated to use new Supabase functions

### API Migration

The following API calls have been migrated from Next.js API routes to Supabase Edge Functions:

- `/api/orders` → `ordersApi.createOrder()`
- `/api/create-payment-link` → `paymentApi.createPaymentLink()`
- `/api/distance-fee` → `deliveryApi.calculateFee()`
- `/api/customer` → `customerApi.lookupCustomer()`

## Database Schema Updates

Ensure your orders table has these columns for ShipDay integration:

```sql
-- Add these columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_delivery_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipday_tip DECIMAL(10,2) DEFAULT 0;
```

## Deployment Instructions

1. **Deploy Supabase Edge Functions**:
   ```bash
   supabase functions deploy process-order
   supabase functions deploy calculate-fee
   supabase functions deploy schedule-delivery
   supabase functions deploy process-scheduled-deliveries
   supabase functions deploy shipday-webhook
   ```

2. **Set Environment Variables**:
   ```bash
   supabase secrets set SHIPDAY_API_KEY=your_api_key
   supabase secrets set STORE_ADDRESS="1989 North Fry Rd, Katy, TX 77494"
   supabase secrets set STORE_PHONE_NUMBER="+12814010758"
   # ... set other required variables
   ```

3. **Configure Database Webhooks**:
   - Set up webhook for orders table insert to trigger `process-order`
   - Configure ShipDay webhook URL to point to `shipday-webhook` function

4. **Update Frontend**:
   - Ensure environment variables are set in your frontend deployment
   - Update any remaining API calls to use the new Supabase functions

## Testing

### Test ShipDay Integration

1. **Test Fee Calculation**:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/calculate-fee \
     -H "Authorization: Bearer your_anon_key" \
     -H "Content-Type: application/json" \
     -d '{"address": "123 Main St, Houston, TX 77001", "dropoffPhoneNumber": "+1234567890"}'
   ```

2. **Test Order Processing**:
   - Create a test order in the database
   - Verify ShipDay delivery is created
   - Check order is updated with tracking information

3. **Test Webhook**:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/shipday-webhook \
     -H "Content-Type: application/json" \
     -d '{"external_delivery_id": "test_id", "status": "picked_up"}'
   ```

## Troubleshooting

### Common Issues

1. **Missing ShipDay API Key**:
   - Error: "Missing ShipDay API key"
   - Solution: Set `SHIPDAY_API_KEY` environment variable

2. **Invalid Address Format**:
   - Error: "Invalid address format"
   - Solution: Ensure addresses include city and state

3. **Delivery Creation Failed**:
   - Check ShipDay API logs
   - Verify store address and phone number are correct
   - Ensure customer phone number is valid

### Logs and Monitoring

- Check Supabase Edge Function logs in the dashboard
- Monitor ShipDay delivery status updates
- Review order processing in the database

## Migration Checklist

- [ ] Set up ShipDay account and API key
- [ ] Deploy all Supabase Edge Functions
- [ ] Configure environment variables
- [ ] Set up database webhooks
- [ ] Update frontend API calls
- [ ] Test fee calculation
- [ ] Test order processing
- [ ] Test scheduled deliveries
- [ ] Test webhook handling
- [ ] Update documentation
- [ ] Monitor production deployment

## Support

For issues with ShipDay integration:
1. Check ShipDay API documentation
2. Review Supabase Edge Function logs
3. Verify environment variables are set correctly
4. Test with ShipDay's sandbox environment first 