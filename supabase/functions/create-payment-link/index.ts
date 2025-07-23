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
    console.log('create-payment-link received body:', JSON.stringify(body, null, 2));
    
    // Load Square credentials
    const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID');
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      throw new Error('Missing Square access token or location ID');
    }
    // Calculate totals
    const subtotal = body.cartItems.reduce((total, item) => {
      let price = 0;
      if (typeof item.price === 'string') {
        price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      } else if (typeof item.price === 'number') {
        price = item.price;
      } else {
        price = parseFloat(String(item.price));
      }
      return total + (price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.0825; // 8.25% tax rate
    const deliveryFee = body.deliveryFee || 0;
    const total = subtotal + tax + deliveryFee;
    
    console.log('Payment calculation:', {
      subtotal,
      tax,
      deliveryFee,
      total
    });

    // Build payment link request
    const paymentLinkReq = {
      idempotency_key: crypto.randomUUID(),
      order: {
        location_id: SQUARE_LOCATION_ID,
        line_items: body.cartItems.map((item) => {
          // Parse price correctly
          let price = 0;
          if (typeof item.price === 'string') {
            // Remove $ and any other non-numeric characters except decimal point
            price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
          } else if (typeof item.price === 'number') {
            price = item.price;
          } else {
            price = parseFloat(String(item.price));
          }
          
          // Convert to cents for Square API
          const amountInCents = Math.round(price * 100);
          
          console.log(`Item: ${item.name}, Original price: ${item.price}, Parsed price: ${price}, Amount in cents: ${amountInCents}`);
          
          return {
            name: item.name,
            quantity: item.quantity.toString(),
            base_price_money: {
              amount: amountInCents,
              currency: "USD"
            },
            note: item.specialInstructions || undefined
          };
        }),
        service_charges: [
          // Sales Tax
          {
            name: "Sales Tax",
            percentage: "8.25",
            calculation_phase: "TOTAL_PHASE"
          },
          // Delivery Fee (only if delivery)
          ...(deliveryFee > 0 ? [{
            name: "Delivery Fee",
            amount_money: {
              amount: Math.round(deliveryFee * 100),
              currency: "USD"
            },
            calculation_phase: "TOTAL_PHASE"
          }] : [])
        ],
        reference_id: body.orderId?.toString() || undefined,
        customer_notes: body.customerInfo?.special_instructions || ""
      },
      checkout_options: {
        redirect_url: body.redirectUrl || `${body.baseUrl || 'https://desi-flavors-hub.vercel.app'}/payment-success`,
        allow_tipping: true,
        tip_options: {
          percentage_tip_options: ["15", "18", "20", "25"],
          custom_tip_field: true
        }
      }
    };
    
    console.log('Service charges being sent:', paymentLinkReq.order.service_charges);
    console.log('Sending request to Square:', JSON.stringify(paymentLinkReq, null, 2));
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