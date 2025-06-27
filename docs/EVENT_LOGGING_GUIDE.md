# Event Logging Guide for Desi Flavors Hub

## Overview

This guide documents the event logging conventions and analytics system for the Desi Flavors Hub application. Our analytics system captures comprehensive user behavior, business metrics, and system events to enable data-driven decision making.

## Event Structure

All events are stored in the `analytics_events` table with the following structure:

```sql
{
  id: uuid,
  event_name: string,
  event_data: jsonb,
  user_id: string (optional),
  session_id: string (optional),
  page_url: string (optional),
  referrer: string (optional),
  user_agent: string (optional),
  ip_address: inet (optional),
  created_at: timestamp
}
```

## Event Categories

### 1. User Behavior Events

#### Cart Events
- **cart_item_added**
  ```json
  {
    "menu_item_id": 123,
    "menu_item_name": "Chicken Biryani",
    "quantity": 2,
    "unit_price": 15.99,
    "total_price": 31.98,
    "category": "Biryani"
  }
  ```

- **cart_item_removed**
  ```json
  {
    "menu_item_id": 123,
    "menu_item_name": "Chicken Biryani",
    "quantity_removed": 1,
    "remaining_quantity": 1
  }
  ```

- **cart_abandoned**
  ```json
  {
    "cart_value": 45.97,
    "item_count": 3,
    "time_spent_minutes": 5.5,
    "last_action": "view_checkout"
  }
  ```

#### Menu Interaction Events
- **menu_item_viewed**
  ```json
  {
    "menu_item_id": 123,
    "menu_item_name": "Chicken Biryani",
    "category": "Biryani",
    "price": 15.99,
    "view_duration_seconds": 30
  }
  ```

- **search_performed**
  ```json
  {
    "search_term": "spicy chicken",
    "results_count": 8,
    "filters_applied": ["spicy", "chicken"],
    "clicked_result": true
  }
  ```

#### Order Events
- **order_started**
  ```json
  {
    "order_id": 456,
    "cart_value": 45.97,
    "item_count": 3,
    "fulfillment_method": "delivery"
  }
  ```

- **order_completed**
  ```json
  {
    "order_id": 456,
    "total_amount": 52.46,
    "payment_method": "credit_card",
    "fulfillment_method": "delivery",
    "promo_code_used": "SAVE10",
    "discount_amount": 4.60
  }
  ```

- **order_cancelled**
  ```json
  {
    "order_id": 456,
    "cancellation_reason": "customer_request",
    "refund_amount": 52.46,
    "stage": "processing"
  }
  ```

### 2. Loyalty Program Events

- **loyalty_points_earned**
  ```json
  {
    "customer_id": 789,
    "order_id": 456,
    "points_earned": 52,
    "total_points": 152,
    "earning_rate": 1.0
  }
  ```

- **loyalty_points_redeemed**
  ```json
  {
    "customer_id": 789,
    "order_id": 457,
    "points_redeemed": 100,
    "reward_value": 10.00,
    "remaining_points": 52
  }
  ```

### 3. Marketing Events

- **newsletter_signup**
  ```json
  {
    "email": "customer@example.com",
    "source": "checkout_page",
    "opt_in_marketing": true
  }
  ```

- **promo_code_applied**
  ```json
  {
    "promo_code": "SAVE10",
    "discount_type": "percentage",
    "discount_value": 10,
    "order_value_before": 45.97,
    "discount_amount": 4.60
  }
  ```

- **campaign_email_sent**
  ```json
  {
    "campaign_id": "winback_2024_01",
    "customer_id": 789,
    "segment_id": "at_risk",
    "email_subject": "We miss you!",
    "incentive_offered": "20% off"
  }
  ```

### 4. System Events

- **daily_metric_calculated**
  ```json
  {
    "metric_name": "cart_abandonment_rate",
    "current_value": 0.65,
    "previous_value": 0.58,
    "percentage_change": 12.1,
    "is_anomaly": true
  }
  ```

- **anomaly_detected**
  ```json
  {
    "metric": "conversion_rate",
    "current_value": 0.015,
    "expected_range": {"min": 0.02, "max": 0.15},
    "severity": "high",
    "recommendations": ["Check website performance", "Review pricing"]
  }
  ```

## Implementation Guidelines

### 1. Event Naming Convention

- Use **snake_case** for event names
- Be descriptive but concise
- Group related events with common prefixes:
  - `cart_*` for cart-related events
  - `order_*` for order-related events
  - `loyalty_*` for loyalty program events
  - `campaign_*` for marketing campaign events

### 2. Event Data Structure

- Use consistent field names across similar events
- Include relevant context (IDs, names, values)
- Store monetary values as numbers, not strings
- Include timestamps for duration calculations
- Add categorical data for segmentation

### 3. Required vs Optional Fields

**Always Include:**
- `event_name`
- `created_at` (automatic)

**Include When Available:**
- `user_id` (for logged-in users)
- `session_id` (for session tracking)
- `page_url` (for page-specific events)

**Optional Context:**
- `referrer`
- `user_agent`
- `ip_address`

## Logging Functions

### Basic Event Logging

```typescript
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

// Log a simple event
await logAnalyticsEvent('menu_item_viewed', {
  menu_item_id: 123,
  menu_item_name: 'Chicken Biryani',
  category: 'Biryani',
  price: 15.99
});

// Log with user context
await logAnalyticsEvent('cart_item_added', {
  menu_item_id: 123,
  quantity: 2,
  total_price: 31.98
}, userId, sessionId);
```

### Loyalty Event Logging

```typescript
import { awardLoyaltyPoints } from '@/utils/loyaltyAndAnalytics';

// Award points and log automatically
await awardLoyaltyPoints(customerId, orderId, orderTotal);
```

### Cart Event Logging

```typescript
// In CartContext.tsx
const addToCart = async (item: MenuItem, quantity: number) => {
  // Add to cart logic...
  
  // Log the event
  await logAnalyticsEvent('cart_item_added', {
    menu_item_id: item.id,
    menu_item_name: item.name,
    quantity,
    unit_price: item.price,
    total_price: item.price * quantity,
    category: item.category
  });
};
```

## Analytics Queries

### Common Analytics Queries

```sql
-- Daily active users
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM analytics_events 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Conversion funnel
SELECT 
  'menu_viewed' as stage,
  COUNT(DISTINCT session_id) as users
FROM analytics_events 
WHERE event_name = 'menu_item_viewed'
  AND created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'cart_added' as stage,
  COUNT(DISTINCT session_id) as users
FROM analytics_events 
WHERE event_name = 'cart_item_added'
  AND created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'order_completed' as stage,
  COUNT(DISTINCT session_id) as users
FROM analytics_events 
WHERE event_name = 'order_completed'
  AND created_at >= NOW() - INTERVAL '7 days';

-- Cart abandonment analysis
WITH cart_sessions AS (
  SELECT DISTINCT session_id
  FROM analytics_events 
  WHERE event_name = 'cart_item_added'
    AND created_at >= NOW() - INTERVAL '7 days'
),
completed_sessions AS (
  SELECT DISTINCT session_id
  FROM analytics_events 
  WHERE event_name = 'order_completed'
    AND created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  COUNT(c.session_id) as total_cart_sessions,
  COUNT(co.session_id) as completed_sessions,
  ROUND(
    (COUNT(c.session_id) - COUNT(co.session_id))::numeric / 
    COUNT(c.session_id) * 100, 2
  ) as abandonment_rate
FROM cart_sessions c
LEFT JOIN completed_sessions co ON c.session_id = co.session_id;
```

## Monitoring and Alerts

### Automated Monitoring

The system automatically monitors key metrics and sends alerts when anomalies are detected:

```typescript
import { analyticsMonitor } from '@/utils/analyticsMonitoring';

// Run daily analytics (scheduled job)
await analyticsMonitor.runDailyAnalytics();

// Get anomaly history
const anomalies = await analyticsMonitor.getAnomalyHistory(30);
```

### Custom Alerts

Set up custom alerts for business-critical metrics:

```typescript
// Example: Alert when daily orders drop below threshold
const dailyOrders = await getDailyOrderCount();
if (dailyOrders < 10) {
  await sendAlert('Low daily orders', `Only ${dailyOrders} orders today`);
}
```

## Testing Event Logging

### Unit Tests

```typescript
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

describe('Event Logging', () => {
  it('should log cart events correctly', async () => {
    const mockEvent = {
      menu_item_id: 123,
      quantity: 2,
      total_price: 31.98
    };

    await logAnalyticsEvent('cart_item_added', mockEvent);
    
    // Verify event was logged
    const events = await getAnalyticsEvents('cart_item_added');
    expect(events).toHaveLength(1);
    expect(events[0].event_data).toMatchObject(mockEvent);
  });
});
```

### Integration Tests

```typescript
describe('Order Flow Analytics', () => {
  it('should track complete order funnel', async () => {
    // Simulate user journey
    await logAnalyticsEvent('menu_item_viewed', { menu_item_id: 123 });
    await logAnalyticsEvent('cart_item_added', { menu_item_id: 123, quantity: 1 });
    await logAnalyticsEvent('order_completed', { order_id: 456 });

    // Verify funnel tracking
    const funnel = await calculateConversionFunnel();
    expect(funnel.view_to_cart).toBeGreaterThan(0);
    expect(funnel.cart_to_order).toBeGreaterThan(0);
  });
});
```

## Performance Considerations

### Batch Logging

For high-volume events, consider batching:

```typescript
const eventBatch = [];

// Collect events
eventBatch.push({
  event_name: 'page_view',
  event_data: { page: '/menu' }
});

// Batch insert every 10 events or 5 seconds
if (eventBatch.length >= 10 || lastFlush > 5000) {
  await supabase.from('analytics_events').insert(eventBatch);
  eventBatch.length = 0;
}
```

### Data Retention

Implement data retention policies:

```sql
-- Archive old events (keep last 2 years)
DELETE FROM analytics_events 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Or move to archive table
INSERT INTO analytics_events_archive 
SELECT * FROM analytics_events 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## Privacy and Compliance

### Data Privacy

- Never log personally identifiable information (PII) in event data
- Use hashed user IDs when possible
- Implement data anonymization for analytics
- Respect user consent preferences

### GDPR Compliance

```typescript
// Anonymize user data on deletion request
const anonymizeUserData = async (userId: string) => {
  await supabase
    .from('analytics_events')
    .update({ 
      user_id: 'anonymized',
      event_data: supabase.rpc('anonymize_event_data', { event_data })
    })
    .eq('user_id', userId);
};
```

## Best Practices

1. **Consistent Naming**: Use established naming conventions
2. **Rich Context**: Include relevant business context in events
3. **Error Handling**: Always handle logging failures gracefully
4. **Performance**: Don't block user experience for analytics
5. **Testing**: Test analytics in development and staging
6. **Documentation**: Keep this guide updated as events evolve
7. **Privacy**: Respect user privacy and data protection laws

## Troubleshooting

### Common Issues

1. **Missing Events**: Check network connectivity and error logs
2. **Duplicate Events**: Implement idempotency keys for critical events
3. **Performance Impact**: Use async logging and batching
4. **Data Quality**: Validate event data before logging

### Debug Mode

Enable debug logging in development:

```typescript
const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development';

if (DEBUG_ANALYTICS) {
  console.log('Analytics Event:', eventName, eventData);
}
```

## Future Enhancements

- Real-time event streaming
- Machine learning for predictive analytics
- Advanced customer segmentation
- Automated A/B testing
- Custom dashboard builder
- Data warehouse integration 