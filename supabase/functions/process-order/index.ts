// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// This endpoint will be triggered by a database webhook when a new order is created
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { record } = await req.json();
    if (!record) {
      throw new Error("No order record provided");
    }

    console.log("Processing new order:", record.id);

    // Load Square credentials
    const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID');
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      throw new Error('Missing Square access token or location ID');
    }

    // Prepare line items for Square
    const items = typeof record.items === "string" ? JSON.parse(record.items) : record.items;
    const lineItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      base_price_money: {
        amount: Math.round(parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * 100),
        currency: "USD"
      },
      note: item.specialInstructions || undefined
    }));

    // Build Square order request
    const orderRequest = {
      idempotency_key: crypto.randomUUID(),
      order: {
        location_id: SQUARE_LOCATION_ID,
        line_items: lineItems,
        reference_id: record.id.toString(),
        customer_notes: record.special_instructions || ""
      }
    };

    // Send order to Square
    const response = await fetch("https://connect.squareup.com/v2/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderRequest)
    });

    const responseBody = await response.json();
    if (!response.ok) {
      console.error("Square Orders API error:", responseBody);
      throw new Error(responseBody.errors?.map((e) => e.detail).join(", ") || "Square API error");
    }

    console.log("Square order created:", responseBody.order.id);

    // Save per-item special instructions to order_items table (if not already handled)
    // This assumes you have access to SUPABASE_URL and SERVICE_ROLE_KEY
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      for (const item of items) {
        await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            order_id: record.id,
            menu_item_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            special_instructions: item.specialInstructions || null
          })
        });
      }
    }

    // If this is a delivery order
    if (record.order_type === 'delivery' && record.delivery_address) {
      // Only trigger ShipDay for ASAP orders immediately; scheduled orders will be handled later
      if (record.scheduled_time === 'ASAP') {
        let retryCount = 0;
        const maxRetries = 3;
        let lastError = null;

        while (retryCount < maxRetries) {
          try {
            // ShipDay API credentials
            const SHIPDAY_API_KEY = Deno.env.get('SHIPDAY_API_KEY');
            if (!SHIPDAY_API_KEY) {
              throw new Error('MISSING_CREDENTIALS: ShipDay API key not configured');
            }

            // Build ShipDay delivery payload
            const external_delivery_id = crypto.randomUUID();
            const deliveryPayload = {
              external_delivery_id,
              pickup_address: Deno.env.get('STORE_ADDRESS') || '1989 North Fry Rd, Katy, TX 77494',
              pickup_business_name: 'Desi Flavors Hub',
              pickup_phone_number: Deno.env.get('STORE_PHONE_NUMBER') || '+12814010758',
              pickup_instructions: `Order #${record.id} - ${record.customer_name}`,
              dropoff_address: record.delivery_address,
              dropoff_business_name: record.customer_name,
              dropoff_phone_number: record.customer_phone,
              dropoff_instructions: `Delivery for ${record.customer_name}`,
              order_value: Math.round(record.total_amount * 100),
              tip: Math.round((record.shipday_tip || 0) * 100), // Use allocated tip amount in cents
              delivery_type: 'standard',
              customer_email: record.customer_email || '',
              customer_name: record.customer_name,
              items: items.map(item => `${item.quantity}x ${item.name}${item.specialInstructions ? ` (${item.specialInstructions})` : ''}`).join('; ')
            };

            console.log('ShipDay delivery payload:', deliveryPayload);

            // Create delivery via ShipDay
            const shipdayRes = await fetch('https://api.shipday.com/deliveries', {
              method: 'POST',
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(SHIPDAY_API_KEY + ':')}`
              },
              body: JSON.stringify(deliveryPayload)
            });

            const shipdayJson = await shipdayRes.json();
            if (!shipdayRes.ok) {
              const errorType = shipdayRes.status === 400 ? 'INVALID_REQUEST' : 
                              shipdayRes.status === 401 ? 'UNAUTHORIZED' : 
                              shipdayRes.status === 403 ? 'FORBIDDEN' : 
                              shipdayRes.status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR';
              throw new Error(`${errorType}: ${shipdayJson.error || JSON.stringify(shipdayJson)}`);
            }

            console.log('ShipDay delivery created:', shipdayJson.external_delivery_id);

            // Update Supabase order with external_delivery_id
            if (SUPABASE_URL && SERVICE_ROLE_KEY) {
              const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${record.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SERVICE_ROLE_KEY,
                  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                  external_delivery_id: shipdayJson.external_delivery_id,
                  tracking_url: shipdayJson.tracking_url || null
                })
              });

              if (!patchRes.ok) {
                console.error('Failed to patch external_delivery_id:', await patchRes.text());
              } else {
                console.log('Supabase order updated with external_delivery_id');
              }
            } else {
              console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; cannot patch external_delivery_id');
            }

            break;
          } catch (error) {
            lastError = error;
            retryCount++;
            console.error(`ShipDay delivery attempt ${retryCount} failed:`, error.message);
            
            // Don't retry for certain error types
            if (error.message.includes('MISSING_CREDENTIALS') || 
                error.message.includes('INVALID_REQUEST') || 
                error.message.includes('FORBIDDEN')) {
              console.error('Non-retryable error, stopping attempts');
              break;
            }
            
            // Wait before retry (exponential backoff)
            if (retryCount < maxRetries) {
              const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        // If all retries failed, log error but don't fail the entire function
        if (retryCount >= maxRetries && lastError) {
          console.error(`All ${maxRetries} ShipDay delivery attempts failed. Final error:`, lastError.message);
          
          // Update order status to indicate delivery creation failed
          try {
            // Update Square order metadata with delivery_id and tracking_url
            await fetch(`https://connect.squareup.com/v2/orders/${responseBody.order.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order: {
                  metadata: {
                    delivery_id: null,
                    tracking_url: null
                  }
                }
              })
            });
            console.log('Square order updated with delivery metadata');
          } catch (e) {
            console.error('Failed to update Square order metadata:', e);
          }
        }
      } else {
        console.log(`Scheduled order ${record.id} - skipping immediate ShipDay delivery; will be processed later`);
      }
    }

    // Twilio voice call notification (SMS temporarily disabled)
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_FROM_PHONE = Deno.env.get('TWILIO_FROM_PHONE');
    const TWILIO_TO_PHONE = Deno.env.get('TWILIO_TO_PHONE');

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_PHONE && TWILIO_TO_PHONE) {
      // Prepare item list for voice call
      const parsedItems = typeof record.items === 'string' ? JSON.parse(record.items) : record.items;
      const itemsList = parsedItems.map((item) => `${item.quantity} x ${item.name}`).join(', ');

      // Voice call TwiML
      const twiml = `<Response><Say voice="alice">You have received a new Square order. Order number: ${record.id}. Items: ${itemsList}.</Say></Response>`;
      
      const callParams = new URLSearchParams({
        From: TWILIO_FROM_PHONE,
        To: TWILIO_TO_PHONE,
        Twiml: twiml
      });

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: callParams.toString()
      });
    }

    return new Response(JSON.stringify({
      success: true,
      square_order_id: responseBody.order.id
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });

  } catch (error) {
    console.error("Error processing order:", error);
    return new Response(JSON.stringify({
      error: error.message || "Unknown error occurred"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
}); 