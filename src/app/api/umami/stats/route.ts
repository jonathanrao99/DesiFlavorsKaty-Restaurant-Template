import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startAt = searchParams.get('startAt');
  const endAt = searchParams.get('endAt');

  try {
    const url = new URL(`https://us.umami.is/api/websites/${process.env.UMAMI_WEBSITE_ID}/stats`);
    
    if (startAt) url.searchParams.set('startAt', startAt);
    if (endAt) url.searchParams.set('endAt', endAt);

    const res = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${process.env.UMAMI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.error('Umami API error:', res.status, res.statusText);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Umami stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 