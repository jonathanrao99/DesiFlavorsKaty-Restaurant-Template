# Analytics Integration Guide

This guide covers the comprehensive analytics dashboard integration for Desi Flavors Hub, including Umami, Google Analytics 4, and custom analytics.

## Overview

The analytics system provides:

- **Sales & Revenue Insights**: Daily/weekly/monthly totals, AOV, peak hours, item popularity
- **Order Management**: Live order queue, status tracking, scheduled deliveries
- **Marketing & Promotions**: QR code campaigns, email marketing, social media ROI
- **Customer Analytics**: Feedback, loyalty tracking, demographics
- **Geographic Analysis**: Delivery zones, order density, optimization insights
- **Reports & Exports**: Automated PDF/CSV reports, scheduled reporting

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Umami Analytics
UMAMI_WEBSITE_ID=your_umami_website_id
UMAMI_API_KEY=your_umami_api_key

# Google Analytics 4
GA4_PROPERTY_ID=your_ga4_property_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json

# Database & Supabase (already configured)
DATABASE_URL=your_database_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Umami Setup

1. Sign up for Umami Cloud at https://us.umami.is/
2. Add your website and get the Website ID
3. Generate an API key from your account settings
4. Add the tracking script to your site (already done in layout.tsx)

### 3. Google Analytics 4 Setup

1. Create a GA4 property in your Google Analytics account
2. Enable the Google Analytics Data API
3. Create a service account and download the JSON key file
4. Set up UTM tracking for QR codes:
   - Campaign: `qr_menu`
   - Source: `physical_qr`
   - Medium: `qr_code`

### 4. QR Code Campaign Tracking

Generate QR codes with UTM parameters:
```
https://yoursite.com/menu?utm_source=physical_qr&utm_medium=qr_code&utm_campaign=qr_menu
```

## Features

### 1. Comprehensive Dashboard

Access via `/nimda/dashboard` - includes:

- **Overview Tab**: Sales trends, key metrics
- **Sales & Revenue Tab**: Top items, peak hours, revenue analysis
- **Order Management Tab**: Live queue, status breakdown
- **Marketing Tab**: QR campaigns, traffic sources
- **Customers Tab**: Loyalty metrics, feedback
- **Geographic Tab**: Delivery zones, optimization insights
- **Reports Tab**: Export functionality

### 2. API Endpoints

- `/api/umami/pageviews` - Umami pageview data
- `/api/umami/events` - Umami event tracking
- `/api/umami/stats` - Umami statistics
- `/api/ga4/qr-campaign` - GA4 QR campaign data
- `/api/analytics/comprehensive` - Combined analytics data

### 3. Real-time Analytics

- Live order tracking
- Real-time visitor data (via Umami)
- QR scan tracking
- Customer feedback monitoring

### 4. Automated Reporting

- Daily sales summaries
- Weekly performance reports
- Monthly business analytics
- Custom report generation
- Scheduled email reports

## Key Metrics Tracked

### Sales Metrics
- Total revenue (daily/weekly/monthly)
- Average order value
- Order count and trends
- Peak hours analysis
- Item popularity ranking

### Marketing Metrics
- QR code scan rates
- Campaign conversion rates
- Website traffic sources
- Social media engagement
- Email marketing performance

### Operational Metrics
- Order processing times
- Delivery performance
- Customer satisfaction ratings
- Repeat customer rates
- Geographic order distribution

### Customer Metrics
- New vs returning customers
- Loyalty program engagement
- Feedback sentiment analysis
- Customer lifetime value
- Demographic insights

## Performance Optimization

### 1. Data Caching
- Analytics data cached for 60 seconds
- Reports cached for optimal performance
- Real-time data for critical metrics only

### 2. Mobile Optimization
- Responsive dashboard design
- Touch-friendly controls
- Optimized for mobile management

### 3. Error Handling
- Graceful fallbacks for API failures
- Loading states for better UX
- Error logging and monitoring

## Security & Privacy

### 1. Data Protection
- Customer data anonymization
- GDPR compliance considerations
- Secure API endpoints

### 2. Access Control
- Admin-only analytics access
- Role-based permissions
- Secure authentication

## Troubleshooting

### Common Issues

1. **Umami Data Not Loading**
   - Check UMAMI_WEBSITE_ID and UMAMI_API_KEY
   - Verify Umami tracking script is active
   - Check network connectivity

2. **GA4 Data Missing**
   - Verify GA4_PROPERTY_ID is correct
   - Check service account permissions
   - Ensure Google Analytics Data API is enabled

3. **Charts Not Rendering**
   - Check browser console for errors
   - Verify Recharts is properly installed
   - Ensure data format matches chart requirements

### Performance Issues

1. **Slow Dashboard Loading**
   - Check API response times
   - Implement data pagination
   - Consider caching strategies

2. **High Memory Usage**
   - Optimize chart data processing
   - Implement virtual scrolling for large datasets
   - Monitor component re-renders

## Future Enhancements

### Planned Features
- Advanced customer segmentation
- Predictive analytics
- A/B testing integration
- Social media analytics
- Inventory optimization insights
- Advanced reporting builder

### Integration Roadmap
- Stripe analytics integration
- WhatsApp Business API
- Instagram/Facebook insights
- Email marketing platforms
- Loyalty program enhancements

## Support

For technical support or questions:
1. Check this documentation
2. Review API endpoint responses
3. Check browser console for errors
4. Verify environment variables
5. Test with minimal data sets

## License

This analytics integration is part of the Desi Flavors Hub project and follows the same licensing terms. 