import { NextResponse } from 'next/server';

// Server-side route to calculate delivery fee based on distance and time
export async function POST(request: Request) {
  try {
    const { address, orderDate } = await request.json();
    const ORIGIN = '1989 North Fry Rd, Katy, TX 77449';
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Missing Google Maps API key' }, { status: 500 });
    }
    const params = new URLSearchParams({
      origins: ORIGIN,
      destinations: address,
      key,
    });
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`
    );
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch distance' }, { status: response.status });
    }
    const data = await response.json();
    const distanceInMeters = data.rows[0]?.elements[0]?.distance?.value;
    if (typeof distanceInMeters !== 'number') {
      return NextResponse.json({ error: 'Invalid distance data' }, { status: 500 });
    }
    const distanceInMiles = distanceInMeters / 1609.34;
    // Pricing logic (apply only highest surcharge bracket)
    let fee = 5.99; // base fee
    if (distanceInMiles > 8) {
      fee += 10;
    } else if (distanceInMiles > 6) {
      fee += 5;
    } else if (distanceInMiles > 3) {
      fee += 2;
    }
    // Peak hour surcharge: 8pm–10pm
    const hour = new Date(orderDate).getHours();
    if (hour >= 20 && hour < 22) fee += 2;
    return NextResponse.json({ fee, distanceInMiles });
  } catch (error) {
    console.error('Distance-fee route error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 