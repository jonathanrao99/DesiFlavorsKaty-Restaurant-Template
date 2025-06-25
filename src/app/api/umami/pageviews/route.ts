import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startAt = searchParams.get('startAt');
  const endAt = searchParams.get('endAt');
  const unit = searchParams.get('unit') || 'day';

  try {
    const url = new URL(`https://us.umami.is/api/websites/${process.env.UMAMI_WEBSITE_ID}/pageviews`);
    
    if (startAt) url.searchParams.set('startAt', startAt);
    if (endAt) url.searchParams.set('endAt', endAt);
    url.searchParams.set('unit', unit);

    const res = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${process.env.UMAMI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.error('Umami API error:', res.status, res.statusText);
      return NextResponse.json({ error: 'Failed to fetch pageviews' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Umami pageviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 