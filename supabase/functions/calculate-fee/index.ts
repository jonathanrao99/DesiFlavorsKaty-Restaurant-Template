// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, dropoffPhoneNumber } = await req.json();
    console.log('calculate-fee received body:', { address, dropoffPhoneNumber });
    if (!address) throw new Error('No address provided');
    if (!dropoffPhoneNumber) throw new Error('No dropoffPhoneNumber provided');

    // Calculate delivery fee via DoorDash Drive Create Quote API
    async function generateJWT() {
      const developer_id = Deno.env.get('DD_DEVELOPER_ID');
      const key_id = Deno.env.get('DD_KEY_ID');
      const signing_secret = Deno.env.get('DD_SIGNING_SECRET');
      if (!developer_id || !key_id || !signing_secret) throw new Error('Missing DoorDash credentials');
      const header = { alg: 'HS256', typ: 'JWT', 'dd-ver': 'DD-JWT-V1' };
      const iat = Math.floor(Date.now() / 1000);
      const exp = iat + 300;
      const payload = { aud: 'doordash', iss: developer_id, kid: key_id, iat, exp };
      const encoder = new TextEncoder();
      const base64url = (data: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(data)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const headerBase64 = base64url(encoder.encode(JSON.stringify(header)));
      const payloadBase64 = base64url(encoder.encode(JSON.stringify(payload)));
      const dataToSign = `${headerBase64}.${payloadBase64}`;
      // Decode base64url-encoded signing secret to raw bytes
      const b64 = signing_secret.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
      const secretBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
      const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
      const signatureBase64 = base64url(signature);
      return `${dataToSign}.${signatureBase64}`;
    }
    const token = await generateJWT();
    const external_delivery_id = crypto.randomUUID();
    const quotePayload = {
      external_delivery_id,
      locale: 'en-US',
      order_fulfillment_method: 'standard',
      pickup_address: Deno.env.get('STORE_ADDRESS'),
      dropoff_address: address,
      dropoffPhoneNumber,
    };
    console.log('calculate-fee quotePayload:', quotePayload);
    const quoteRes = await fetch('https://openapi.doordash.com/drive/v2/quotes', {
      method: 'POST',
      headers: { ...corsHeaders, 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(quotePayload),
    });
    const quoteJson = await quoteRes.json();
    if (!quoteRes.ok) throw new Error(quoteJson.error || JSON.stringify(quoteJson));
    const fee = Number((quoteJson.fee / 100).toFixed(2));
    return new Response(JSON.stringify({ fee }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    console.error('Delivery fee calculation error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 