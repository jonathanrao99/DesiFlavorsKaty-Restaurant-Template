// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { external_delivery_id, dropoff_address, dropoff_phone_number } = await req.json();

    // Validate required fields
    if (!external_delivery_id) throw new Error('Missing external_delivery_id');
    if (!dropoff_address) throw new Error('Missing dropoff_address');
    if (!dropoff_phone_number) throw new Error('Missing dropoff_phone_number');

    // Read store details from environment
    const pickup_address = Deno.env.get('STORE_ADDRESS') || '1989 North Fry Rd, Katy, TX 77494';
    const pickup_phone_number = Deno.env.get('STORE_PHONE_NUMBER') || '+12814010758';

    if (!pickup_address) throw new Error('Missing STORE_ADDRESS in env');
    if (!pickup_phone_number) throw new Error('Missing STORE_PHONE_NUMBER in env');

    // ShipDay API credentials
    const SHIPDAY_API_KEY = Deno.env.get('SHIPDAY_API_KEY');
    if (!SHIPDAY_API_KEY) {
      throw new Error('Missing ShipDay API key');
    }

    // Build delivery payload
    const deliveryPayload = {
      external_delivery_id,
      pickup_address,
      pickup_business_name: 'Desi Flavors Hub',
      pickup_phone_number,
      pickup_instructions: `Order #${external_delivery_id}`,
      dropoff_address,
      dropoff_phone_number,
      delivery_type: 'standard'
    };

    console.log('ShipDay delivery payload:', deliveryPayload);

    // Call ShipDay Create Delivery endpoint
    const deliveryRes = await fetch('https://api.shipday.com/deliveries', {
      method: 'POST',
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(SHIPDAY_API_KEY + ':')}`
      },
      body: JSON.stringify(deliveryPayload)
    });

    const deliveryJson = await deliveryRes.json();
    if (!deliveryRes.ok) {
      if (deliveryJson.code === 'duplicate_delivery_id') {
        return new Response(JSON.stringify(deliveryJson), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        });
      }
      throw new Error(deliveryJson.error || JSON.stringify(deliveryJson));
    }

    // Return the full delivery response
    return new Response(JSON.stringify(deliveryJson), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Delivery scheduling error:', error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}); 