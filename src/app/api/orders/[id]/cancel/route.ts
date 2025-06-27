import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

// Generate DoorDash JWT
async function generateDoorDashJWT() {
  const developer_id = process.env.DOORDASH_DRIVE_DEVELOPER_ID;
  const key_id = process.env.DOORDASH_DRIVE_KEY_ID;
  const signing_secret = process.env.DOORDASH_DRIVE_SIGNING_SECRET;
  if (!developer_id || !key_id || !signing_secret) throw new Error('Missing DoorDash credentials');
  
  const header = { alg: 'HS256', typ: 'JWT', 'dd-ver': 'DD-JWT-V1' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 300;
  const payload = { aud: 'doordash', iss: developer_id, kid: key_id, iat, exp };
  
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const dataToSign = `${headerB64}.${payloadB64}`;
  const signature = createHmac('sha256', Buffer.from(signing_secret, 'base64'))
    .update(dataToSign)
    .digest('base64url');
  return `${dataToSign}.${signature}`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    
    // Fetch order from Supabase
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const fetchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=external_delivery_id,status`,
      {
        headers: {
          apikey: SERVICE_KEY,
          authorization: `Bearer ${SERVICE_KEY}`,
        }
      }
    );
    
    if (!fetchRes.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const orders = await fetchRes.json();
    const order = orders[0];
    
    if (!order?.external_delivery_id) {
      return NextResponse.json({ error: 'No delivery associated with this order' }, { status: 400 });
    }
    
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order already cancelled' }, { status: 400 });
    }
    
    // Generate JWT and cancel DoorDash delivery
    const token = await generateDoorDashJWT();
    
    const cancelRes = await fetch(
      `https://openapi.doordash.com/drive/v2/deliveries/${order.external_delivery_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_status: 'cancelled',
          cancellation_reason: 'merchant_requested'
        }),
      }
    );
    
    if (!cancelRes.ok) {
      const errorData = await cancelRes.json();
      if (errorData.field_errors?.some((e: any) => e.field === 'delivery_status' && e.error.includes('dasher_assigned'))) {
        return NextResponse.json({ 
          error: 'Cannot cancel: Dasher already assigned. Please contact DoorDash support.' 
        }, { status: 400 });
      }
      throw new Error(errorData.error || 'Failed to cancel delivery');
    }
    
    // Update order status in Supabase
    await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      }
    );
    
    return NextResponse.json({ success: true, message: 'Delivery cancelled successfully' });
    
  } catch (error: any) {
    console.error('Error cancelling delivery:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 