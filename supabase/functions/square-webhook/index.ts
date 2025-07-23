// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with"
};

serve(async (req) => {
  console.log('=== SQUARE WEBHOOK FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SHIPDAY_API_KEY = Deno.env.get('SHIPDAY_API_KEY');
    const STORE_ADDRESS = Deno.env.get('STORE_ADDRESS');
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SHIPDAY_API_KEY || !STORE_ADDRESS) {
      throw new Error('Missing required environment variables');
    }

    // Parse the webhook payload
    const body = await req.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Check if this is a payment success event
    const eventType = body.type;
    const data = body.data;

    if (eventType === 'payment.created' && data?.object?.payment?.status === 'COMPLETED') {
      const payment = data.object.payment;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      
      console.log('Payment completed:', { orderId, paymentId });

      // Get order details from Supabase
      const { data: orderData, error: orderError } = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());

      if (orderError || !orderData || orderData.length === 0) {
        throw new Error('Order not found in database');
      }

      const order = orderData[0];
      console.log('Order from database:', order);

      // Calculate proper pickup time with cooking buffer (25 minutes from now)
      const now = new Date();
      const pickupTimeDate = new Date(now.getTime() + (25 * 60 * 1000)); // 25 minutes from now
      
      // Format pickup time as HH:MM AM/PM
      const pickupTimeFormatted = pickupTimeDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Calculate delivery time (pickup time + 15 minutes for delivery)
      const deliveryTimeDate = new Date(pickupTimeDate.getTime() + (15 * 60 * 1000)); // 15 minutes after pickup
      const deliveryTimeFormatted = deliveryTimeDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Create Shipday order
      const shipdayOrderData = {
        orderId: orderId,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email,
        deliveryAddress: order.delivery_address,
        pickupTime: pickupTimeFormatted,
        deliveryTime: deliveryTimeFormatted,
        orderItems: order.items,
        totalAmount: order.total_amount,
        deliveryFee: order.delivery_fee || 0,
        paymentId: paymentId
      };

      console.log('Creating Shipday order with:', shipdayOrderData);

      const createOrderUrl = 'https://api.shipday.com/orders';
      const orderBody = {
        pickupAddress: STORE_ADDRESS,
        dropoffAddress: order.delivery_address,
        orderNumber: orderId,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email || '',
        pickupTime: pickupTimeFormatted,
        deliveryTime: deliveryTimeFormatted,
        amount: order.total_amount,
        deliveryFee: order.delivery_fee || 0,
        items: order.items,
        paymentId: paymentId
      };
      
      const createOrderResp = await fetch(createOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${SHIPDAY_API_KEY}`,
        },
        body: JSON.stringify(orderBody),
      });
      
      const createOrderText = await createOrderResp.text();
      console.log('Shipday create order response:', createOrderResp.status, createOrderText);
      
      if (!createOrderResp.ok) {
        throw new Error(`Failed to create Shipday order: ${createOrderText}`);
      }
      
      // Update order status in Supabase
      const { error: updateError } = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          status: 'confirmed',
          shipday_order_id: JSON.parse(createOrderText).orderId,
          payment_id: paymentId
        })
      });

      if (updateError) {
        console.error('Failed to update order status:', updateError);
      }

      console.log('Successfully processed payment and created Shipday order');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Webhook processing error:', error.message);
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