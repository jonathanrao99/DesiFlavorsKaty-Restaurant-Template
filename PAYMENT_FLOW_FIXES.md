# Payment Flow Fixes and Improvements

## Issues Fixed

### 1. Google Maps API Loading Issue ✅

**Problem**: The error "Google Maps Places API library must be loaded" occurred because `use-places-autocomplete` was trying to use the Google Maps API before it was fully loaded.

**Solution**: 
- Added proper loading states and error handling in `AddressAutocomplete.tsx`
- Only initialize Places API when Google Maps is loaded (`isLoaded` check)
- Added fallback input field when Google Maps fails to load
- Added loading placeholder text while API loads

**Files Modified**:
- `src/components/payment/AddressAutocomplete.tsx`

### 2. Square Webhook Implementation ✅

**Problem**: The Square webhook was just a placeholder and didn't process payments or create DoorDash deliveries.

**Solution**: 
- Implemented complete webhook handler for `payment.updated` events
- Added payment verification and order status updates
- Integrated DoorDash Drive API for delivery order creation
- Added proper error handling and logging

**Features Added**:
- Payment completion processing
- Order status updates (confirmed → pending for deliveries)
- Automatic DoorDash delivery creation for delivery orders
- Webhook signature verification (optional)
- Proper scheduled time handling for deliveries

**Files Modified**:
- `src/app/api/webhooks/square/route.ts`

### 3. Scheduled Time Format Consistency ✅

**Problem**: The `scheduledTime` variable was inconsistently handled as both Date objects and strings, causing potential issues.

**Solution**:
- Standardized scheduled time handling in payment pages
- Always convert Date objects to ISO strings before API calls
- Maintain 'ASAP' as a string literal for immediate orders
- Ensure consistent format across all API endpoints

**Files Modified**:
- `src/app/payment/page.tsx`
- `src/app/payment/PaymentPageClient.tsx`

### 4. Environment Variable Consistency ✅

**Problem**: DoorDash environment variables had inconsistent naming across different files.

**Solution**:
- Standardized all DoorDash environment variables to use `DOORDASH_DRIVE_*` prefix
- Updated all API endpoints and edge functions
- Added hardcoded store address and phone for reliability

**Environment Variables Used**:
- `DOORDASH_DRIVE_DEVELOPER_ID`
- `DOORDASH_DRIVE_KEY_ID`
- `DOORDASH_DRIVE_SIGNING_SECRET`

**Files Modified**:
- `src/app/api/webhooks/square/route.ts`
- `src/app/api/webhooks/doordash/route.ts`
- `src/app/api/orders/[id]/status/route.ts`
- `supabase/functions/calculate-fee/index.ts`

### 5. TypeScript Errors ✅

**Problem**: Missing dependencies and type mismatches in DatePicker component.

**Solution**:
- Installed missing `react-icons` package
- Fixed DatePicker `onChange` handler type to accept `Date | null`
- Improved type safety throughout the payment flow

**Files Modified**:
- `src/app/payment/PaymentPageClient.tsx`
- `package.json` (added react-icons)

## Complete Payment Flow

### 1. Cart → Payment Page
- User selects fulfillment method (pickup/delivery) in cart
- Navigates to payment page with cart context preserved
- Delivery fee calculated automatically for delivery orders

### 2. Customer Information
- Customer enters name, email, phone
- For delivery: Google Places autocomplete for address
- Address validation triggers delivery fee calculation via DoorDash API

### 3. Scheduling
- ASAP orders available during business hours (5 PM - 1 AM)
- Scheduled orders allow date/time selection with 30-minute intervals
- Time filtering ensures orders are only scheduled during operating hours

### 4. Order Creation
- Order created in Supabase database with all details
- Square payment link generated with order reference
- User redirected to Square checkout

### 5. Payment Processing (Square Webhook)
- Payment completion triggers webhook
- Order status updated to 'confirmed'
- For delivery orders: DoorDash delivery automatically created
- Order status updated to 'pending' once delivery is scheduled

### 6. Order Fulfillment
- Pickup orders: Customer notified, ready for pickup
- Delivery orders: DoorDash driver assigned and delivery tracked
- Order status updates via DoorDash webhooks

## API Endpoints

### Core Payment APIs
- `POST /api/orders` - Create order in database
- `POST /api/create-payment-link` - Generate Square payment link
- `POST /api/webhooks/square` - Process payment completion
- `POST /api/webhooks/doordash` - Handle delivery status updates

### Supporting APIs
- `POST /functions/calculate-fee` - Calculate delivery fee via DoorDash
- `POST /api/orders/[id]/status` - Update order status (admin)

## Database Schema

Orders table includes:
- `id` - Primary key
- `items` - Cart items JSON
- `customer_name`, `customer_email`, `customer_phone` - Customer info
- `order_type` - 'pickup' or 'delivery'
- `delivery_address` - For delivery orders
- `scheduled_time` - ISO string or 'ASAP'
- `total_amount` - Final order total
- `payment_id` - Square payment ID (after payment)
- `external_delivery_id` - DoorDash delivery ID (for deliveries)
- `status` - 'pending', 'confirmed', 'completed', 'cancelled'

## Environment Variables Required

```env
# Square
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox|production
SQUARE_WEBHOOK_SIGNATURE_KEY=optional_webhook_key

# DoorDash Drive
DOORDASH_DRIVE_DEVELOPER_ID=your_developer_id
DOORDASH_DRIVE_KEY_ID=your_key_id
DOORDASH_DRIVE_SIGNING_SECRET=your_signing_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SUPABASE_FUNCTION_URL=your_functions_url

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# App
NEXT_PUBLIC_BASE_URL=your_app_url
```

## Testing Checklist

### Frontend Flow
- [ ] Cart items display correctly
- [ ] Fulfillment method selection works
- [ ] Google Maps address autocomplete works
- [ ] Delivery fee calculation works
- [ ] ASAP/scheduled time selection works
- [ ] Form validation works
- [ ] Payment redirect works

### Backend Processing
- [ ] Orders created in database
- [ ] Square payment links generated
- [ ] Webhook processes payments
- [ ] DoorDash deliveries created
- [ ] Order status updates correctly
- [ ] Scheduled times preserved accurately

### Edge Cases
- [ ] Empty cart redirects to cart page
- [ ] Invalid addresses show error
- [ ] ASAP unavailable outside hours
- [ ] Webhook failures don't break flow
- [ ] DoorDash API failures handled gracefully

## Business Hours
- **Operating Hours**: 5:00 PM - 1:00 AM
- **ASAP Orders**: Only available during operating hours
- **Scheduled Orders**: Can be placed anytime, scheduled within operating hours
- **Minimum Schedule Time**: 30 minutes from current time

## Notes
- All monetary values are handled in cents for Square API
- DoorDash delivery fees are calculated in real-time
- Order statuses are updated via webhooks for real-time tracking
- Google Maps API fallback ensures address input always works
- TypeScript strict mode enabled for better type safety 