// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with"
};

serve(async (req) => {
  console.log('=== CALCULATE-FEE FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Debug env vars
  console.log('Supabase calculate-fee environment check:', {
    hasShipDayApiKey: !!Deno.env.get('SHIPDAY_API_KEY'),
    hasStoreAddress: !!Deno.env.get('STORE_ADDRESS'),
    hasStorePhone: !!Deno.env.get('STORE_PHONE_NUMBER'),
    shipDayApiKeyLength: Deno.env.get('SHIPDAY_API_KEY')?.length || 0
  });

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Use Shipday /on-demand/estimate endpoint (no orderId required)
    let estimatedFee = null;
    let usedShipday = false;
    try {
      const SHIPDAY_API_KEY = Deno.env.get('SHIPDAY_API_KEY');
      const STORE_ADDRESS = Deno.env.get('STORE_ADDRESS');
      if (!SHIPDAY_API_KEY || !STORE_ADDRESS) throw new Error('Missing Shipday API key or store address');

      // Parse request body for dropoff address
      const { address } = await req.json();
      if (!address) throw new Error('No address provided');

      const estimateUrl = 'https://api.shipday.com/on-demand/estimate';
      const estimateBody = {
        pickupAddress: STORE_ADDRESS,
        dropoffAddress: address,
      };
      const estimateResp = await fetch(estimateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `API-KEY ${SHIPDAY_API_KEY}`,
        },
        body: JSON.stringify(estimateBody),
      });
      const errorText = await estimateResp.text();
      let estimateData = null;
      try { estimateData = JSON.parse(errorText); } catch { estimateData = { errorMessage: errorText }; }
      if (!estimateResp.ok || estimateData.error) {
        console.error('Shipday API error response:', errorText);
        throw new Error(estimateData.errorMessage || 'Shipday estimate API failed');
      }
      estimatedFee = estimateData.fee || estimateData.estimatedFee || null;
      usedShipday = true;
      console.log('Shipday API fee:', estimatedFee);
      // Return the Shipday response
      return new Response(JSON.stringify({
        fee: estimatedFee,
        usedShipday,
        shipday: estimateData
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } catch (err) {
      console.error('Shipday API error, returning 500:', err.message);
      return new Response(JSON.stringify({
        error: err.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

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