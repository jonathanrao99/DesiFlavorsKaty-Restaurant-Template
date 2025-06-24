import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { createHmac } from 'crypto';

// Square client
const sqEnv = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: sqEnv,
});

// DoorDash JWT generator for potential cancels (not needed here)
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

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.log('Received DoorDash webhook:', event);
    const payload = event.payload || event.data || {};
    const status = payload.status?.toLowerCase();
    const externalId = payload.external_delivery_id || payload.delivery_id;
    if (!externalId) {
      return NextResponse.json({ error: 'Missing external_delivery_id' }, { status: 400 });
    }
    // Update status to completed on pickup
    if (status === 'picked_up' || status === 'pickup_complete') {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const url = `${SUPABASE_URL}/rest/v1/orders?external_delivery_id=eq.${externalId}`;
      await fetch(url, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
    }
    // Handle cancelled → refund & cancelled
    if (status === 'cancelled') {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      // Fetch order to refund
      const fetchUrl = `${SUPABASE_URL}/rest/v1/orders?external_delivery_id=eq.${externalId}&select=payment_id,total_amount`;
      const fetchRes = await fetch(fetchUrl, {
        headers: { apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` }
      });
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        const order = data[0];
        if (order?.payment_id) {
          const refundsApi = squareClient.refunds;
          await refundsApi.refundPayment({
            idempotencyKey: crypto.randomUUID(),
            paymentId: order.payment_id,
            amountMoney: { amount: BigInt(Math.round(order.total_amount * 100)), currency: 'USD' }
          });
        }
      }
      // Update status to cancelled
      const updateUrl = `${SUPABASE_URL}/rest/v1/orders?external_delivery_id=eq.${externalId}`;
      await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error in DoorDash webhook handler:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 