import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { createHmac } from 'crypto';

// Initialize Square client
const sqEnv = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: sqEnv,
});

// Helper to generate DoorDash JWT using Node crypto
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

export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const orderId = Number(params.id);
    const { status } = await request.json();
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch current order data via Supabase REST
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const fetchUrl = `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=payment_id,external_delivery_id,total_amount`;
    const fetchRes = await fetch(fetchUrl, {
      headers: {
        apikey: SERVICE_KEY,
        authorization: `Bearer ${SERVICE_KEY}`
      }
    });
    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      return NextResponse.json({ error: errText }, { status: 404 });
    }
    const [order] = await fetchRes.json();
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle cancellation: DoorDash cancel + Square refund
    if (status === 'cancelled') {
      // Cancel DoorDash delivery
      if (order.external_delivery_id) {
        const ddToken = await generateDoorDashJWT();
        await fetch(
          `https://openapi.doordash.com/drive/v2/deliveries/${order.external_delivery_id}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${ddToken}` } }
        );
      }
      // Issue refund via Square
      if (order.payment_id) {
        const refundsApi = squareClient.refunds;
        await refundsApi.refundPayment({
          idempotencyKey: crypto.randomUUID(),
          paymentId: order.payment_id,
          amountMoney: { amount: BigInt(Math.round(order.total_amount * 100)), currency: 'USD' }
        });
      }
    }

    // Update status in Supabase via REST
    const updateUrl = `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!updateRes.ok) {
      const txt = await updateRes.text(); console.error('Update error:', txt);
      return NextResponse.json({ error: txt }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update order status:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
} 