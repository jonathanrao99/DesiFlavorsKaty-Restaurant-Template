import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Extract delivery ID, status, tracking URL from Shipday payload
  const { id: shipdayDeliveryId, status, trackingUrl, orderNumber } = body;
  // Update deliveries and orders tables in Supabase
  // TODO: Implement actual Supabase update logic here
  return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ message: 'Shipday webhook endpoint' });
} 