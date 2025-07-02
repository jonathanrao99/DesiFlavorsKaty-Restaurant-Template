// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { headers: corsHeaders, status: 405 });
    }
    const body = await req.json();
    // Load Square credentials
    const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID');
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      throw new Error('Missing Square access token or location ID');
    }
    // Build payment link request
    const paymentLinkReq = {
      idempotency_key: crypto.randomUUID(),
      order: {
        location_id: SQUARE_LOCATION_ID,
        line_items: body.cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity.toString(),
          base_price_money: {
            amount: Math.round(parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * 100),
            currency: "USD"
          },
          note: item.specialInstructions || undefined
        })),
        reference_id: body.orderId?.toString() || undefined,
        customer_notes: body.customerInfo?.special_instructions || ""
      },
      checkout_options: {
        redirect_url: body.redirectUrl || undefined
      }
    };
    const response = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paymentLinkReq)
    });
    const responseBody = await response.json();
    if (!response.ok) {
      throw new Error(responseBody.errors?.map((e) => e.detail).join(", ") || "Square API error");
    }
    return new Response(JSON.stringify({ url: responseBody.payment_link?.url }), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
}); 