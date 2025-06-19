import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';

// Secure Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Square client
const sqEnv = process.env.SQUARE_ENVIRONMENT === 'production'
  ? SquareEnvironment.Production
  : SquareEnvironment.Sandbox;
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: sqEnv,
});

// Helper to generate DoorDash JWT
async function generateDoorDashJWT() {
  const developer_id = Deno.env.get('DD_DEVELOPER_ID');
  const key_id = Deno.env.get('DD_KEY_ID');
  const signing_secret = Deno.env.get('DD_SIGNING_SECRET');
  if (!developer_id || !key_id || !signing_secret) throw new Error('Missing DoorDash credentials');
  const header = { alg: 'HS256', typ: 'JWT', 'dd-ver': 'DD-JWT-V1' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 300;
  const payload = { aud: 'doordash', iss: developer_id, kid: key_id, iat, exp };
  const encoder = new TextEncoder();
  const base64url = (data: Uint8Array) => btoa(String.fromCharCode(...data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)));
  const toSign = `${headerB64}.${payloadB64}`;
  const keyBytes = Uint8Array.from(atob(signing_secret.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(toSign));
  const sigB64 = base64url(new Uint8Array(sig));
  return `${toSign}.${sigB64}`;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number(params.id);
    const { status } = await request.json();
    if (!['pending', 'success', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch current order data
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('payment_id, external_delivery_id, total_amount')
      .eq('id', orderId)
      .single();
    if (fetchErr || !order) {
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

    // Update status in Supabase
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update order status:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
} 