// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Debug env vars
  console.log('Supabase calculate-fee ShipDay credentials:', {
    hasApiKey: !!Deno.env.get('SHIPDAY_API_KEY')
  });

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { address, dropoffPhoneNumber } = await req.json();
    console.log('calculate-fee received body:', {
      address,
      dropoffPhoneNumber
    });

    if (!address) throw new Error('No address provided');
    if (!dropoffPhoneNumber) throw new Error('No dropoffPhoneNumber provided');

    // Calculate delivery fee via ShipDay API
    const SHIPDAY_API_KEY = Deno.env.get('SHIPDAY_API_KEY');
    if (!SHIPDAY_API_KEY) {
      throw new Error('Missing ShipDay API key');
    }

    const external_delivery_id = crypto.randomUUID();
    const quotePayload = {
      external_delivery_id,
      pickup_address: Deno.env.get('STORE_ADDRESS') || '1989 North Fry Rd, Katy, TX 77494',
      pickup_business_name: 'Desi Flavors Hub',
      pickup_phone_number: Deno.env.get('STORE_PHONE_NUMBER') || '+12814010758',
      dropoff_address: address,
      dropoff_phone_number: dropoffPhoneNumber,
      delivery_type: 'standard',
      order_value: 1000 // $10.00 in cents for fee calculation
    };

    console.log('calculate-fee quotePayload:', quotePayload);

    // Get delivery quote from ShipDay
    const quoteRes = await fetch('https://api.shipday.com/deliveries/quote', {
      method: 'POST',
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(SHIPDAY_API_KEY + ':')}`
      },
      body: JSON.stringify(quotePayload)
    });

    const quoteJson = await quoteRes.json();
    if (!quoteRes.ok) {
      throw new Error(quoteJson.error || JSON.stringify(quoteJson));
    }

    // Extract fee from ShipDay response
    const fee = Number((quoteJson.fee || 0).toFixed(2));

    // Return only fee
    return new Response(JSON.stringify({
      fee
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Delivery fee calculation error:', error.message);
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