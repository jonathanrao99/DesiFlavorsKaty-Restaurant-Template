import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Extract delivery ID, status, and tracking URL from Shipday payload
  const { id: shipdayDeliveryId, status, trackingUrl, orderNumber } = body;
  try {
    // Update the deliveries table
    const { error: deliveryError } = await supabase
      .from('deliveries')
      .update({ status, external_delivery_id: shipdayDeliveryId, tracking_url: trackingUrl })
      .eq('order_number', orderNumber);
    if (deliveryError) console.error('Error updating deliveries table:', deliveryError);

    // Optionally, update the order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderNumber);
    if (orderError) console.error('Error updating orders table:', orderError);
  } catch (err) {
    console.error('Supabase webhook update error:', err);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
  return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ message: 'Shipday webhook endpoint' });
} 