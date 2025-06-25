// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type",
};

// Generate a JWT for DoorDash API
async function generateDoorDashJWT() {
  const developer_id = Deno.env.get("DOORDASH_DRIVE_DEVELOPER_ID");
  const key_id = Deno.env.get("DOORDASH_DRIVE_KEY_ID");
  const signing_secret = Deno.env.get("DOORDASH_DRIVE_SIGNING_SECRET");
  if (!developer_id || !key_id || !signing_secret) throw new Error('Missing DoorDash credentials');
  const header = { alg: 'HS256', typ: 'JWT', 'dd-ver': 'DD-JWT-V1' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 300;
  const payload = { aud: 'doordash', iss: developer_id, kid: key_id, iat, exp };
  const encoder = new TextEncoder();
  const base64url = (data) => btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)));
  const dataToSign = `${headerB64}.${payloadB64}`;
  // Decode secret
  const b64 = signing_secret.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const secretBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
  const signatureB64 = base64url(signature);
  return `${dataToSign}.${signatureB64}`;
}

// Calculate prep time based on order complexity
function calculatePrepTime(order) {
  const itemCount = Array.isArray(order.items) ? 
    order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1;
  return Math.min(25, Math.max(15, itemCount * 3)); // 3 minutes per item, 15-25 min range
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing Supabase environment variables');

    const now = new Date();
    console.log(`Processing scheduled deliveries at ${now.toISOString()}`);

    // Fetch scheduled delivery orders that are ready to be processed
    const fetchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?status=eq.scheduled&order_type=eq.delivery&select=*`,
      { headers: { apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` } }
    );
    
    if (!fetchRes.ok) {
      const txt = await fetchRes.text();
      console.error('Failed fetching scheduled orders:', txt);
      throw new Error('Failed to fetch orders');
    }
    
    const orders = await fetchRes.json();
    console.log(`Found ${orders.length} scheduled orders to evaluate`);
    const processed = [];

    for (const order of orders) {
      if (!order.scheduled_time || order.scheduled_time === 'ASAP') continue;
      
      const scheduledTime = new Date(order.scheduled_time);
      const timeDiffHours = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      console.log(`Order ${order.id}: scheduled for ${scheduledTime.toISOString()}, diff: ${timeDiffHours.toFixed(2)} hours`);
      
      // Process if within 1.5 hours of scheduled time (matches webhook logic)
      if (timeDiffHours <= 1.5 && timeDiffHours > -0.5) { // Allow 30 min past scheduled time
        try {
          console.log(`Creating DoorDash delivery for scheduled order ${order.id}`);
          
          const token = await generateDoorDashJWT();
          const externalId = crypto.randomUUID();
          const prepTime = calculatePrepTime(order);
          
          // Calculate when food should be ready (15 min before delivery)
          const readyTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
          
          const payload = {
            external_delivery_id: externalId,
            locale: 'en-US',
            order_fulfillment_method: 'standard',
            pickup_address: '1989 North Fry Rd, Katy, TX 77494',
            pickup_business_name: 'Desi Flavors Hub',
            pickup_phone_number: '+12814010758',
            pickup_instructions: `Order #${order.id} - ${order.customer_name} - Ready: ${readyTime.toLocaleTimeString()}`,
            dropoff_address: order.delivery_address,
            dropoff_business_name: order.customer_name,
            dropoff_phone_number: order.customer_phone,
            dropoff_instructions: `Delivery for ${order.customer_name}`,
            order_value: Math.round(order.total_amount * 100),
            deliver_at: scheduledTime.toISOString(),
          };

          console.log('DoorDash delivery payload:', payload);

          const ddRes = await fetch('https://openapi.doordash.com/drive/v2/deliveries', {
            method: 'POST',
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload),
          });
          
          const ddJson = await ddRes.json();
          
          if (!ddRes.ok) {
            console.error(`DoorDash error for order ${order.id}:`, ddJson);
          } else {
            console.log(`DoorDash delivery created for order ${order.id}:`, ddJson);
            
            // Update order to pending status with delivery info
            const updateRes = await fetch(
              `${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`,
              {
                method: 'PATCH',
                headers: { 
                  apikey: SERVICE_KEY, 
                  authorization: `Bearer ${SERVICE_KEY}`, 
                  'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                  external_delivery_id: externalId, 
                  status: 'pending',
                  prep_time: readyTime.toISOString()
                }),
              }
            );
            
            if (!updateRes.ok) {
              console.error(`Failed to update order ${order.id}:`, await updateRes.text());
            } else {
              processed.push({ 
                orderId: order.id, 
                deliveryId: externalId,
                scheduledTime: scheduledTime.toISOString(),
                readyTime: readyTime.toISOString()
              });
            }
          }
        } catch (e) {
          console.error(`Error processing order ${order.id}:`, e.message);
        }
      } else if (timeDiffHours > 1.5) {
        console.log(`Order ${order.id} not ready yet (${timeDiffHours.toFixed(2)} hours remaining)`);
      } else {
        console.log(`Order ${order.id} is past processing window (${Math.abs(timeDiffHours).toFixed(2)} hours overdue)`);
      }
    }

    const result = { 
      success: true, 
      processed, 
      total: orders.length,
      processedCount: processed.length,
      timestamp: now.toISOString()
    };
    
    console.log('Scheduled delivery processing complete:', result);
    
    return new Response(JSON.stringify(result), { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    });
  } catch (err) {
    console.error('Scheduled function error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message, timestamp: new Date().toISOString() }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
}); 