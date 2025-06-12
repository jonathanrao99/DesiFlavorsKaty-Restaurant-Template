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
    const {
      external_delivery_id,
      dropoff_address,
      dropoff_phone_number
    } = await req.json();

    // Validate required fields
    if (!external_delivery_id) throw new Error('Missing external_delivery_id');
    if (!dropoff_address) throw new Error('Missing dropoff_address');
    if (!dropoff_phone_number) throw new Error('Missing dropoff_phone_number');

    // Read store details from environment
    const pickup_address = Deno.env.get('STORE_ADDRESS');
    // Support legacy env or fallback to Twilio from phone number
    const pickup_phone_number = Deno.env.get('STORE_PHONE_NUMBER') ?? Deno.env.get('TWILIO_FROM_PHONE');
    if (!pickup_address) throw new Error('Missing STORE_ADDRESS in env');
    if (!pickup_phone_number) throw new Error('Missing STORE_PHONE_NUMBER or TWILIO_FROM_PHONE in env');

    // Function to generate JWT for DoorDash
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

    // Build delivery payload
    const deliveryPayload = {
      external_delivery_id,
      pickup_address,
      pickup_phone_number,
      dropoff_address,
      dropoff_phone_number
    };

    // Call DoorDash Create Delivery endpoint
    const deliveryRes = await fetch('https://openapi.doordash.com/drive/v2/deliveries', {
      method: 'POST',
      headers: { ...corsHeaders, 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(deliveryPayload),
    });
    const deliveryJson = await deliveryRes.json();
    if (!deliveryRes.ok) throw new Error(deliveryJson.error || JSON.stringify(deliveryJson));

    // Return the full delivery response
    return new Response(JSON.stringify(deliveryJson), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Delivery scheduling error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 