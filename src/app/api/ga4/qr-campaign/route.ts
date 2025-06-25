import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function GET() {
  try {
    if (!process.env.GA4_PROPERTY_ID) {
      return NextResponse.json({ error: 'GA4_PROPERTY_ID not configured' }, { status: 500 });
    }

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dimensions: [
        { name: 'campaign' }, 
        { name: 'source' },
        { name: 'medium' }
      ],
      metrics: [
        { name: 'sessions' }, 
        { name: 'conversions' },
        { name: 'activeUsers' }
      ],
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensionFilter: {
        filter: { 
          fieldName: 'campaign', 
          stringFilter: { 
            matchType: 'CONTAINS', 
            value: 'qr' 
          } 
        }
      }
    });

    return NextResponse.json({
      data: response?.rows || [],
      rowCount: response?.rowCount || 0,
      totals: response?.totals || []
    });
  } catch (error) {
    console.error('Error fetching GA4 QR campaign data:', error);
    return NextResponse.json({ error: 'Failed to fetch GA4 data' }, { status: 500 });
  }
} 